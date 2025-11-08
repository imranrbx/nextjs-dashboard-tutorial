import prisma from '@/app/lib/prisma';
import { formatCurrency } from './utils';

const ITEMS_PER_PAGE = 6;

/**
 * Fetch all revenue records
 */
export async function fetchRevenue() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany();
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

/**
 * Fetch latest 5 invoices with user details
 */
export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true, image_url: true, email: true },
        },
      },
    });

    const latestInvoices = data.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.user.name,
      image_url: invoice.user.image_url,
      email: invoice.user.email,
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

/**
 * Fetch dashboard card data (counts + total revenue)
 */
export async function fetchCardData() {
  try {
    const [invoiceCount, userCount, invoiceStatus] = await Promise.all([
      prisma.invoice.count(),
      prisma.user.count(),
      prisma.invoice.groupBy({
        by: ['status'],
        _sum: { amount: true },
      }),
    ]);

    const totalPaid = invoiceStatus.find((s) => s.status === 'PAID')?._sum.amount ?? 0;
    const totalPending = invoiceStatus.find((s) => s.status === 'PENDING')?._sum.amount ?? 0;

    return {
      numberOfInvoices: invoiceCount,
      numberOfUsers: userCount,
      totalPaidInvoices: formatCurrency(totalPaid),
      totalPendingInvoices: formatCurrency(totalPending),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

/**
 * Fetch paginated & filtered invoices with user info
 */
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },

        ],
      },
      include: {
        user: { select: { name: true, email: true, image_url: true } },
      },
      orderBy: { date: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

/**
 * Get total pages for filtered invoices
 */
export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.invoice.count({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

/**
 * Fetch a single invoice by ID
 */
export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true, user_id: true, amount: true, status: true },
    });

    if (!invoice) return null;

    return {
      ...invoice,
      amount: invoice.amount / 100, // convert cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

/**
 * Fetch all users (id + name)
 */
export async function fetchUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return users;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all users.');
  }
}

/**
 * Fetch users with their total invoices, paid and pending sums
 */
export async function fetchFilteredUsers(query: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        Invoice: { select: { amount: true, status: true } },
      },
      orderBy: { name: 'asc' },
    });
    const userList = users.map((user) => {
      const total_invoices = user.Invoice.length;
      const total_pending = user.Invoice
        .filter((i) => i.status === 'PENDING')
        .reduce((sum, i) => sum + i.amount, 0);
      const total_paid = user.Invoice
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image_url: user.image_url,
        total_invoices,
        total_pending: formatCurrency(total_pending),
        total_paid: formatCurrency(total_paid),
      };
    });

    return userList;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch user table.');
  }
}

/**
 * Fetch all categories with pagination and search
 */
export async function fetchFilteredCategories(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

/**
 * Get total pages for filtered categories
 */
export async function fetchCategoriesPages(query: string) {
  try {
    const count = await prisma.category.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of categories.');
  }
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category.');
  }
}

/**
 * Fetch all categories (for dropdowns)
 */
export async function fetchCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return categories;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all categories.');
  }
}

/**
 * Fetch all brands with pagination and search
 */
export async function fetchFilteredBrands(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const brands = await prisma.brand.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return brands;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch brands.');
  }
}

/**
 * Get total pages for filtered brands
 */
export async function fetchBrandsPages(query: string) {
  try {
    const count = await prisma.brand.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of brands.');
  }
}

/**
 * Fetch a single brand by ID
 */
export async function fetchBrandById(id: string) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    return brand;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch brand.');
  }
}

/**
 * Fetch all brands (for dropdowns)
 */
export async function fetchBrands() {
  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return brands;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all brands.');
  }
}

/**
 * Fetch all products with pagination and search
 */
export async function fetchFilteredProducts(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

/**
 * Get total pages for filtered products
 */
export async function fetchProductsPages(query: string) {
  try {
    const count = await prisma.product.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of products.');
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        variants: true,
      },
    });

    return product;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product.');
  }
}

/**
 * Fetch all coupons with pagination and search
 */
export async function fetchFilteredCoupons(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return coupons;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch coupons.');
  }
}

/**
 * Get total pages for filtered coupons
 */
export async function fetchCouponsPages(query: string) {
  try {
    const count = await prisma.coupon.count({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of coupons.');
  }
}

/**
 * Fetch a single coupon by ID
 */
export async function fetchCouponById(id: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    return coupon;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch coupon.');
  }
}

/**
 * Fetch all orders with pagination and search
 */
export async function fetchFilteredOrders(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        address: { select: { fullName: true, city: true, state: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

/**
 * Get total pages for filtered orders
 */
export async function fetchOrdersPages(query: string) {
  try {
    const count = await prisma.order.count({
      where: {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of orders.');
  }
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        address: true,
        items: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch order.');
  }
}

/**
 * Fetch all reviews with pagination and search
 */
export async function fetchFilteredReviews(query: string, currentPage: number) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { product: { name: { contains: query, mode: 'insensitive' } } },
          { comment: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip,
    });
    return reviews;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reviews.');
  }
}

/**
 * Get total pages for filtered reviews
 */
export async function fetchReviewsPages(query: string) {
  try {
    const count = await prisma.review.count({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { product: { name: { contains: query, mode: 'insensitive' } } },
          { comment: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of reviews.');
  }
}
