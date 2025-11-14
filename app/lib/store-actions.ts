"use server";

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from './prisma';
import { getCartForUser, getCurrentUser } from './store-service';

const cartFormSchema = z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().min(1).max(10).default(1),
    variantSelections: z.string().optional(),
});

const variantSelectionsSchema = z.array(
    z.object({
        id: z.string(),
        name: z.string(),
        value: z.string(),
        price: z.number().optional().default(0),
    }),
);

const quantitySchema = z.object({
    cartItemId: z.string(),
    quantity: z.coerce.number().int().min(1).max(10),
});

const removeSchema = z.object({
    cartItemId: z.string(),
});

const checkoutSchema = z.object({
    addressMode: z.enum(['existing', 'new']),
    addressId: z.string().optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
});

async function ensureCart(userId: string) {
    return prisma.cart.upsert({
        where: { userId },
        create: {
            userId,
        },
        update: {},
    });
}

function resolveUnitPrice(product: {
    price: number;
    variants: { price: number }[];
}) {
    if (product.price > 0) {
        return product.price;
    }

    if (product.variants.length > 0) {
        const variantPrices = product.variants.map((variant) => variant.price);
        return Math.min(...variantPrices);
    }

    return 0;
}

export async function addToCart(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('You must be logged in to add items to your cart.');
    }

    const rawVariantSelections = formData.get('variantSelections');

    const parsed = cartFormSchema.safeParse({
        productId: formData.get('productId'),
        quantity: formData.get('quantity') ?? 1,
        variantSelections:
            typeof rawVariantSelections === 'string' && rawVariantSelections.length > 0
                ? rawVariantSelections
                : undefined,
    });

    if (!parsed.success) {
        throw new Error('Invalid product selection.');
    }

    const { productId, quantity, variantSelections: variantSelectionsString } =
        parsed.data;

    let variantSelections: z.infer<typeof variantSelectionsSchema> = [];
    if (variantSelectionsString) {
        try {
            const parsedJson = JSON.parse(variantSelectionsString);
            variantSelections = variantSelectionsSchema.parse(parsedJson);
        } catch {
            variantSelections = [];
        }
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            variants: true,
        },
    });

    if (!product) {
        throw new Error('Product not found.');
    }

    const unitPrice =
        product.productType === 'VARIABLE'
            ? (product.price || 0) +
            variantSelections.reduce(
                (sum, selection) => sum + (selection.price ?? 0),
                0,
            )
            : resolveUnitPrice(product);

    if (unitPrice <= 0) {
        throw new Error('Product is not available for purchase.');
    }

    const cart = await ensureCart(user.id);

    const variantSignature =
        variantSelections.length > 0
            ? variantSelections
                .map((selection) => `${selection.id}:${selection.value}`)
                .sort()
                .join('|')
            : null;

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, variantSignature },
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: Math.min(existingItem.quantity + quantity, 10),
            },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                variantSelections:
                    variantSelections.length > 0 ? variantSelections : undefined,
                variantSignature,
                quantity,
                price: unitPrice,
            },
        });
    }

    revalidatePath('/cart');
    revalidatePath('/shop');
}

export async function updateCartQuantity(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('You must be logged in to update cart items.');
    }

    const parsed = quantitySchema.safeParse({
        cartItemId: formData.get('cartItemId'),
        quantity: formData.get('quantity'),
    });

    if (!parsed.success) {
        throw new Error('Invalid cart item update.');
    }

    const { cartItemId, quantity } = parsed.data;

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cart: { userId: user.id },
        },
    });

    if (!cartItem) {
        throw new Error('Cart item not found.');
    }

    await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');
}

export async function removeCartItem(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('You must be logged in to update cart items.');
    }

    const parsed = removeSchema.safeParse({
        cartItemId: formData.get('cartItemId'),
    });

    if (!parsed.success) {
        throw new Error('Invalid cart item removal request.');
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: parsed.data.cartItemId,
            cart: { userId: user.id },
        },
    });

    if (!cartItem) {
        throw new Error('Cart item not found.');
    }

    await prisma.cartItem.delete({
        where: { id: cartItem.id },
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');
}

export async function placeOrder(prevState: { error?: string | null }, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'You must be logged in to place an order.' };
    }

    const cart = await getCartForUser(user.id);
    if (!cart || cart.items.length === 0) {
        return { error: 'Your cart is empty.' };
    }

    const readField = (key: string) => {
        const value = formData.get(key);
        if (typeof value !== 'string') return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    };

    const parsed = checkoutSchema.safeParse({
        addressMode: readField('addressMode'),
        addressId: readField('addressId'),
        fullName: readField('fullName'),
        phone: readField('phone'),
        street: readField('street'),
        city: readField('city'),
        state: readField('state'),
        postalCode: readField('postalCode'),
        country: readField('country'),
    });

    if (!parsed.success) {
        return { error: 'Please review your address details.' };
    }

    const {
        addressMode,
        addressId,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
    } = parsed.data;

    let finalAddressId: string | null = null;

    if (addressMode === 'existing') {
        if (!addressId) {
            return { error: 'Please select an address.' };
        }

        const existingAddress = await prisma.address.findFirst({
            where: { id: addressId, userId: user.id },
        });

        if (!existingAddress) {
            return { error: 'Address not found.' };
        }
        finalAddressId = existingAddress.id;
    } else {
        if (!fullName || !phone || !street || !city || !state || !postalCode || !country) {
            return { error: 'Complete address details are required.' };
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: user.id,
                fullName,
                phone,
                street,
                city,
                state,
                postalCode,
                country,
            },
        });
        finalAddressId = newAddress.id;
    }

    const totalAmount = cart.items.reduce((total, item) => {
        return total + item.quantity * item.price;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                userId: user.id,
                addressId: finalAddressId,
                totalAmount,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
        });

        await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return createdOrder;
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');
    revalidatePath('/account/orders');

    redirect(`/thank-you?orderId=${order.id}`);
}

