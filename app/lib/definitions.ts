export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export type Invoice = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string | null;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  user_id: string;
  amount: number;
  status: 'PENDING' | 'PAID';
};

export type CategoryField = {
  id: string;
  name: string;
};

export type BrandField = {
  id: string;
  name: string;
};

export type Variant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: any;
  productId: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: any;
  categoryId: string | null;
  brandId: string | null;
  productType: 'SIMPLE' | 'VARIABLE';
  variants: Variant[];
  createdAt: Date;
  updatedAt: Date;
};
