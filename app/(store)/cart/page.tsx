import Link from 'next/link';
import { getCartForUser, getCurrentUser } from '@/app/lib/store-service';
import { CartTable } from '@/app/ui/store/cart-table';

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">Log in to view cart</p>
        <p className="mt-2 text-sm text-gray-500">
          Your cart is saved with your profile. Please sign in to continue.
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

  const cart = await getCartForUser(user.id);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Your cart</h1>
        <p className="text-sm text-gray-600">
          Review product pricing, adjust quantities, and continue to checkout.
        </p>
      </header>

      <CartTable items={cart?.items ?? []} coupon={cart?.coupon ?? null} />

      {cart?.items.length ? (
        <div className="text-right">
          <Link
            href="/checkout"
            className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Proceed to checkout
          </Link>
        </div>
      ) : null}
    </div>
  );
}

