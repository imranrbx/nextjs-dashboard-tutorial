import Link from 'next/link';
import { getCurrentUser, getUserOrders } from '@/app/lib/store-service';
import { OrdersTable } from '@/app/ui/store/orders-table';

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          Log in to view your orders
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const orders = await getUserOrders(user.id);
  const activeOrders = orders.filter((order) =>
    ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status),
  );
  const pastOrders = orders.filter((order) =>
    ['DELIVERED', 'CANCELLED'].includes(order.status),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Your orders</h1>
        <p className="text-sm text-gray-600">
          Track active orders and browse your full purchase history.
        </p>
      </header>

      <OrdersTable
        title="Active orders"
        orders={activeOrders}
        emptyMessage="No active orders right now."
      />

      <OrdersTable
        title="Order history"
        orders={pastOrders}
        emptyMessage="You have not completed any orders yet."
      />
    </div>
  );
}

