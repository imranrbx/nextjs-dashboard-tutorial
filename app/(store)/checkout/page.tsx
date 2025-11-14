import Link from 'next/link';
import {
  formatCurrency,
  getCartForUser,
  getCurrentUser,
  getUserAddresses,
} from '@/app/lib/store-service';
import { CheckoutForm } from '@/app/ui/store/checkout-form';

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">Log in to checkout</p>
        <p className="mt-2 text-sm text-gray-500">
          Please sign in so we can associate your order with your account.
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

  const [cart, addresses] = await Promise.all([
    getCartForUser(user.id),
    getUserAddresses(user.id),
  ]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
        <p className="mt-2 text-sm text-gray-500">
          Add products to your cart before heading to checkout.
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

  const subtotal = cart.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <p className="text-sm text-gray-500">
            Review pricing before completing your order.
          </p>
        </div>
        <ul className="divide-y divide-gray-100">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between py-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{item.product.name}</p>
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
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
          <p>Subtotal</p>
          <p>{formatCurrency(subtotal)}</p>
        </div>
        <p className="text-xs text-gray-500">
          Taxes and shipping are calculated after confirming your shipping address.
        </p>
      </section>

      <CheckoutForm addresses={addresses} />
    </div>
  );
}

