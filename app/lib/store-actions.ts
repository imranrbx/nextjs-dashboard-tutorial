"use server";

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from './prisma';
import { getCartForUser, getCurrentUser, calculateCouponDiscount } from './store-service';

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

const couponApplySchema = z.object({
    code: z.string().trim().min(1).max(64),
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

export async function applyCouponToCart(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: 'Log in to apply a coupon.' };
    }

    const parsed = couponApplySchema.safeParse({
        code: formData.get('code'),
    });

    if (!parsed.success) {
        return { success: false, message: 'Enter a valid coupon code.' };
    }

    const code = parsed.data.code.toUpperCase();

    const cart = await ensureCart(user.id);

    const items = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
        return { success: false, message: 'Coupon code not found.' };
    }
    if (!coupon.isActive) {
        return { success: false, message: 'This coupon is inactive.' };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { success: false, message: 'This coupon has expired.' };
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return { success: false, message: 'Minimum order value not met for this coupon.' };
    }

    await prisma.cart.update({
        where: { id: cart.id },
        data: { couponId: coupon.id },
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true, message: 'Coupon applied successfully.' };
}

export async function removeCouponFromCart() {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: 'Log in to remove a coupon.' };
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
        return { success: false, message: 'No active cart found.' };
    }

    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });

    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true, message: 'Coupon removed.' };
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

    const subtotal = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    let discount = 0;
    if (cart.coupon) {
        const active = cart.coupon.isActive && (!cart.coupon.expiresAt || cart.coupon.expiresAt >= new Date());
        discount = active ? calculateCouponDiscount(subtotal, {
            discountType: cart.coupon.discountType as 'PERCENTAGE' | 'FIXED',
            discountValue: cart.coupon.discountValue,
            minOrderValue: cart.coupon.minOrderValue ?? null,
        }) : 0;
    }
    const totalAmount = Math.max(0, subtotal - discount);

    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                userId: user.id,
                addressId: finalAddressId,
                totalAmount,
                couponCode: cart.coupon ? cart.coupon.code : null,
                discountAmount: discount,
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
        await tx.cart.update({ where: { id: cart.id }, data: { couponId: null } });

        return createdOrder;
    });

    revalidatePath('/cart');
    revalidatePath('/checkout');
    revalidatePath('/account/orders');

    redirect(`/thank-you?orderId=${order.id}`);
}

