import type { DefaultSession } from 'next-auth';
import type { Prisma } from '@/app/generated/prisma';
import { auth } from '@/auth';
import prisma from './prisma';
export { formatCurrency } from './currency';

type AuthenticatedUser = {
    id: string;
    name: string;
    email: string | null;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const session = await auth();
    if (!session?.user) return null;

    const userWithId = session.user as DefaultSession['user'] & {
        id?: string;
    };
    const userId = userWithId?.id;
    if (userId) {
        return {
            id: userId,
            name: session.user.name ?? '',
            email: session.user.email ?? null,
        };
    }

    if (!session.user.email) return null;

    const userRecord = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!userRecord) return null;

    return {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
    };
}

export async function getStoreProducts() {
    return prisma.product.findMany({
        include: {
            brand: true,
            category: true,
            variants: true,
            reviews: {
                select: {
                    id: true,
                    rating: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getProductBySlug(slug: string) {
    return prisma.product.findUnique({
        where: { slug },
        include: {
            brand: true,
            category: true,
            variants: true,
            reviews: {
                include: {
                    user: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 6,
            },
        },
    });
}

export async function getCartForUser(userId: string) {
    return prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            images: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}

export async function getCartItemCount(userId: string) {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        select: {
            items: {
                select: { quantity: true },
            },
        },
    });

    if (!cart) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
}

export async function getUserAddresses(userId: string) {
    return prisma.address.findMany({
        where: { userId },
        orderBy: [
            {
                isDefault: 'desc',
            },
            {
                createdAt: 'desc',
            },
        ],
    });
}

export async function getUserOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: { name: true, slug: true },
                    },
                },
            },
            address: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getOrderById(orderId: string, userId: string) {
    return prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
            items: {
                include: {
                    product: {
                        select: { name: true, slug: true },
                    },
                },
            },
            address: true,
            payment: true,
        },
    });
}

type StoredImage = {
    url?: string;
    isDefault?: boolean;
};

function isStoredImage(value: unknown): value is StoredImage {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return typeof record.url === 'string';
}

export function getProductPrimaryImage(images: Prisma.JsonValue): string | null {
    if (!images) return null;
    if (Array.isArray(images)) {
        const normalized = images.filter(isStoredImage);
        const defaultImage = normalized.find((image) => image.isDefault);
        return defaultImage?.url ?? normalized[0]?.url ?? null;
    }

    if (isStoredImage(images)) {
        return images.url ?? null;
    }

    if (typeof images === 'string') {
        return images;
    }

    return null;
}
