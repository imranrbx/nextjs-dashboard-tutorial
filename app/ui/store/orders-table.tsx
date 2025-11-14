import Link from 'next/link';
import { formatCurrency } from '@/app/lib/store-service';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    slug: string;
  };
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderItem[];
  address?: {
    city: string;
    country: string;
  } | null;
};

type OrdersTableProps = {
  title: string;
  orders: Order[];
  emptyMessage: string;
};

const statusClasses: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-800 ring-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  DELIVERED: 'bg-green-50 text-green-800 ring-green-200',
  CANCELLED: 'bg-red-50 text-red-800 ring-red-200',
};

export function OrdersTable({ title, orders, emptyMessage }: OrdersTableProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} products •{' '}
                    {order.address
                      ? `${order.address.city}, ${order.address.country}`
                      : 'No address'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {order.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.product.slug}`}
                        className="rounded-full bg-gray-100 px-3 py-1"
                      >
                        {item.product.name} × {item.quantity}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses[order.status] || 'bg-gray-100 text-gray-800 ring-gray-200'}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

