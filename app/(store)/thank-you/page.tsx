import Link from 'next/link';
import {
  formatCurrency,
  getCurrentUser,
  getOrderById,
} from '@/app/lib/store-service';

type ThankYouPageProps = {
  searchParams?: Promise<{ orderId?: string }>;
};

export default async function ThankYouPage(props: ThankYouPageProps) {
  const sp = (await props.searchParams) ?? {};
  const { orderId } = sp;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          Log in to review your order
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

  if (!orderId) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          Missing order reference
        </p>
        <p className="mt-2 text-sm text-gray-500">
          We couldn’t find an order ID. Please check your email confirmation.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const order = await getOrderById(orderId, user.id);

  if (!order) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          We couldn’t find that order
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Double-check the order link or reach out to support.
        </p>
        <Link
          href="/account/orders"
          className="mt-6 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white"
        >
          View all orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
          Thank you
        </p>
        <h1 className="text-4xl font-bold text-gray-900">
          Your order is confirmed
        </h1>
        <p className="text-sm text-gray-600">
          Order #{order.id.slice(-8).toUpperCase()} —{' '}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
        <ul className="mt-4 divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.product.name}</p>
                <p className="text-gray-500">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
          <p>Total paid</p>
          <p>{formatCurrency(order.totalAmount)}</p>
        </div>
      </section>

      {order.address && (
        <section className="rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Shipping to</h2>
          <p className="mt-2 text-sm text-gray-600">
            {order.address.fullName}
            <br />
            {order.address.street}
            <br />
            {order.address.city}, {order.address.state} {order.address.postalCode}
            <br />
            {order.address.country}
          </p>
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/account/orders"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900"
        >
          View order history
        </Link>
        <Link
          href="/shop"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

