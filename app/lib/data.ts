import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenues`;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, users.name, users.image_url, users.email, invoices.id
      FROM invoices
      JOIN users ON invoices.user_id = users.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM users`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) AS "PAID",
         SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) AS "PENDING"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].PAID ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].PENDING ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const invoices = await sql`
  SELECT
    invoices.id,
    invoices.amount,
    invoices.date,
    invoices.status,
    users.name,
    users.email,
    users.image_url
  FROM invoices
  JOIN users ON invoices.user_id = users.id
  WHERE
    users.name ILIKE ${`%${query}%`} OR
    users.email ILIKE ${`%${query}%`} OR
    invoices.amount::text ILIKE ${`%${query}%`} OR
    invoices.date::text ILIKE ${`%${query}%`} OR
    invoices.status::text ILIKE ${`%${query}%`}
  ORDER BY invoices.date DESC
  LIMIT ${ITEMS_PER_PAGE}
  OFFSET ${offset};
`;
    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN users ON invoices.user_id = users.id
    WHERE
     users.name ILIKE ${`%${query}%`} OR
     users.email ILIKE ${`%${query}%`} OR
     invoices.amount::text ILIKE ${`%${query}%`} OR
     invoices.date::text ILIKE ${`%${query}%`} OR
     invoices.status::text ILIKE ${`%${query}%`}
  `;
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql`
      SELECT
        invoices.id,
        invoices.user_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM users
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch allusers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		 users.id,
		 users.name,
		 users.email,
		 users.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'PENDING' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'PAID' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM users
		LEFT JOIN invoices ON users.id = invoices.user_id
		WHERE
		 users.name ILIKE ${`%${query}%`} OR
       users.email ILIKE ${`%${query}%`}
		GROUP BY users.id,users.name,users.email,users.image_url
		ORDER BY users.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
