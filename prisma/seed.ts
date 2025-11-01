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
            image_url: "/customers/imran-qasim.png"
        },
    });

    const customers = await prisma.user.createManyAndReturn({
        data: [{
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPasswordUser,
            image_url: "/customers/amy-burns.png"
        },
        {
            name: 'Evil Rabbit',
            email: 'evil@rabbit.com',
            password: hashedPasswordUser,
            image_url: '/customers/evil-rabbit.png',

        },
        {
            name: 'Delba de Oliveira',
            email: 'delba@oliveira.com',
            password: hashedPasswordUser,
            image_url: '/customers/delba-de-oliveira.png',
        },
        {
            name: 'Lee Robinson',
            email: 'lee@robinson.com',
            password: hashedPasswordUser,
            image_url: '/customers/lee-robinson.png',
        },
        {
            name: 'Michael Novotny',
            email: 'michael@novotny.com',
            password: hashedPasswordUser,
            image_url: '/customers/michael-novotny.png',
        },
        {
            name: 'Amy Burns',
            email: 'amy@burns.com',
            password: hashedPasswordUser,
            image_url: '/customers/amy-burns.png',
        },
        {
            name: 'Balazs Orban',
            email: 'balazs@orban.com',
            password: hashedPasswordUser,
            image_url: '/customers/balazs-orban.png',
        },
        ],
    });
    // ===== ADDRESSES =====
    if ((await customers).length > 0) {
        const address = await prisma.address.create({
            data: {
                userId: customers[Math.floor(Math.random() * customers.length)].id,
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
        const invoices = await prisma.invoice.createMany({
            data: [{
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 15795,
                status: 'PENDING',
            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 20348,
                status: 'PENDING',

            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 3040,
                status: 'PAID',
            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 44800,
                status: 'PAID',

            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 34577,
                status: 'PENDING',

            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 54246,
                status: 'PENDING',
            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 666,
                status: 'PENDING',

            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 32545,
                status: 'PAID',

            },
            {
                user_id: customers[Math.floor(Math.random() * customers.length)].id,
                amount: 1250,
                status: 'PAID',

            },
            {
                user_id: (await customers)[Math.floor(Math.random() * (await customers).length)].id,
                amount: 8546,
                status: 'PAID',

            },
            {
                user_id: (await customers)[Math.floor(Math.random() * (await customers).length)].id,
                amount: 500,
                status: 'PAID',

            },
            {
                user_id: (await customers)[Math.floor(Math.random() * (await customers).length)].id,
                amount: 8945,
                status: 'PENDING',

            },
            {
                user_id: (await customers)[Math.floor(Math.random() * (await customers).length)].id,
                amount: 1000,
                status: 'PAID',

            },],
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
        const brand1 = await prisma.brand.createMany({
            data: [{ name: 'Apple', slug: 'apple' },
            { name: 'Samsung', slug: 'samsung' },
            { name: 'Nike', slug: 'nike' }],
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
                    userId: customers[Math.floor(Math.random() * customers.length)].id,
                    productId: iphone.id,
                },
                {
                    rating: 4,
                    comment: 'Good quality shirt.',
                    userId: customers[Math.floor(Math.random() * customers.length)].id,
                    productId: tshirt.id,
                },
            ],
        });

        // ===== WISHLIST =====
        await prisma.wishlist.create({
            data: {
                userId: customers[Math.floor(Math.random() * customers.length)].id,
                productId: iphone.id,
            },
        });

        // ===== CART =====
        const cart = await prisma.cart.create({
            data: {
                userId: customers[Math.floor(Math.random() * customers.length)].id,
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
                userId: customers[Math.floor(Math.random() * customers.length)].id,
                addressId: (await address).id,
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
        await prisma.revenue.createMany({
            data: [
                { month: 'Jan', revenue: 2000 },
                { month: 'Feb', revenue: 1800 },
                { month: 'Mar', revenue: 2200 },
                { month: 'Apr', revenue: 2500 },
                { month: 'May', revenue: 2300 },
                { month: 'Jun', revenue: 3200 },
                { month: 'Jul', revenue: 3500 },
                { month: 'Aug', revenue: 3700 },
                { month: 'Sep', revenue: 2500 },
                { month: 'Oct', revenue: 2800 },
                { month: 'Nov', revenue: 3000 },
                { month: 'Dec', revenue: 4800 },
            ]
        })
    }
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
