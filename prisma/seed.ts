// prisma/seed.ts
import { PrismaClient, Role, DiscountType, OrderStatus, PaymentStatus } from '@/app/generated/prisma';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');
    const hashedPasswordAdmin = await bcrypt.hash('123456', 10);
    const hashedPasswordUser = await bcrypt.hash('pakistan', 10);
    // ===== USERS =====
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPasswordAdmin, // hash this in real project
            role: Role.ADMIN,
        },
    });

    const customer = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPasswordUser,
        },
    });

    // ===== ADDRESSES =====
    const address = await prisma.address.create({
        data: {
            userId: customer.id,
            fullName: 'John Doe',
            phone: '+123456789',
            street: '123 Main St',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90001',
            country: 'USA',
            isDefault: true,
        },
    });

    // ===== CATEGORIES =====
    const categories = await prisma.category.createMany({
        data: [
            { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops and more' },
            { name: 'Clothing', slug: 'clothing', description: 'Men and Women Fashion' },
            { name: 'Home Appliances', slug: 'home-appliances', description: 'Everything for your home' },
        ],
    });

    // ===== BRANDS =====
    const brand1 = await prisma.brand.create({
        data: { name: 'Apple', slug: 'apple' },
    });
    const brand2 = await prisma.brand.create({
        data: { name: 'Samsung', slug: 'samsung' },
    });
    const brand3 = await prisma.brand.create({
        data: { name: 'Nike', slug: 'nike' },
    });

    // ===== PRODUCTS =====
    const iphone = await prisma.product.create({
        data: {
            name: 'iPhone 15 Pro',
            slug: 'iphone-15-pro',
            description: 'Apple’s latest iPhone with A17 Pro chip',
            price: 1199,
            stock: 50,
            images: JSON.stringify([
                'https://dummyimage.com/400x400/000/fff&text=iPhone+15+Pro',
            ]),
            category: { connect: { slug: 'electronics' } },
            brand: { connect: { slug: 'apple' } },
            variants: {
                create: [
                    { name: 'iPhone 15 Pro 128GB', sku: 'IPH15P-128', price: 1199, stock: 20 },
                    { name: 'iPhone 15 Pro 256GB', sku: 'IPH15P-256', price: 1299, stock: 30 },
                ],
            },
        },
    });

    const tshirt = await prisma.product.create({
        data: {
            name: 'Nike Air T-Shirt',
            slug: 'nike-air-tshirt',
            description: 'Comfortable cotton t-shirt with Nike Air logo',
            price: 49,
            stock: 100,
            images: JSON.stringify([
                'https://dummyimage.com/400x400/111/fff&text=Nike+Tshirt',
            ]),
            category: { connect: { slug: 'clothing' } },
            brand: { connect: { slug: 'nike' } },
        },
    });

    // ===== REVIEWS =====
    await prisma.review.createMany({
        data: [
            {
                rating: 5,
                comment: 'Excellent phone!',
                userId: customer.id,
                productId: iphone.id,
            },
            {
                rating: 4,
                comment: 'Good quality shirt.',
                userId: customer.id,
                productId: tshirt.id,
            },
        ],
    });

    // ===== WISHLIST =====
    await prisma.wishlist.create({
        data: {
            userId: customer.id,
            productId: iphone.id,
        },
    });

    // ===== CART =====
    const cart = await prisma.cart.create({
        data: {
            userId: customer.id,
            items: {
                create: [
                    { productId: iphone.id, quantity: 1, price: 1199 },
                    { productId: tshirt.id, quantity: 2, price: 49 },
                ],
            },
        },
    });

    // ===== ORDER =====
    const order = await prisma.order.create({
        data: {
            userId: customer.id,
            addressId: address.id,
            totalAmount: 1297, // 1199 + 49 + 49
            status: OrderStatus.DELIVERED,
            items: {
                create: [
                    { productId: iphone.id, quantity: 1, price: 1199 },
                    { productId: tshirt.id, quantity: 2, price: 49 },
                ],
            },
            payment: {
                create: {
                    method: 'Credit Card',
                    transactionId: 'TXN123456',
                    status: PaymentStatus.SUCCESS,
                },
            },
        },
    });

    // ===== COUPONS =====
    await prisma.coupon.createMany({
        data: [
            {
                code: 'WELCOME10',
                description: '10% off for new users',
                discountType: DiscountType.PERCENTAGE,
                discountValue: 10,
            },
            {
                code: 'SAVE50',
                description: '$50 off orders above $500',
                discountType: DiscountType.FIXED,
                discountValue: 50,
                minOrderValue: 500,
            },
        ],
    });

    console.log('✅ Seed completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
