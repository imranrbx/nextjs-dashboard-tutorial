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
