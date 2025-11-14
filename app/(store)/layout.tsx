import Link from 'next/link';
import { ReactNode } from 'react';
import { signOut } from '@/auth';
import { PowerIcon } from '@heroicons/react/24/outline';
import {
    getCartItemCount,
    getCurrentUser,
} from '@/app/lib/store-service';

export default async function StoreLayout({
    children,
}: {
    children: ReactNode;
}) {
    const user = await getCurrentUser();
    const cartCount = user ? await getCartItemCount(user.id) : 0;
    const displayName = user?.name || user?.email || 'Account';

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <Link href="/" className="text-xl font-bold text-gray-900">
                        Acme Commerce
                    </Link>
                    <nav className="flex flex-wrap gap-6 text-sm font-medium text-gray-600">
                        <Link href="/shop" className="hover:text-gray-900">
                            Shop
                        </Link>
                        <Link href="/cart" className="hover:text-gray-900">
                            Cart
                        </Link>
                        <Link href="/checkout" className="hover:text-gray-900">
                            Checkout
                        </Link>
                        <Link href="/account/orders" className="hover:text-gray-900">
                            My orders
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4 text-sm">
                        {user ? (
                            <>
                                <p className="text-gray-700">
                                    Hi, <span className="font-semibold">{displayName}</span>
                                </p>
                                <Link
                                    href="/cart"
                                    className="rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-900"
                                >
                                    Cart ({cartCount})
                                </Link>
                                {/* Logout button */}
                                <form action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}>
                                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                                        <PowerIcon className="w-6" />
                                        <div className="hidden md:block">Sign Out</div>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="rounded-full bg-gray-900 px-4 py-2 font-semibold text-white"
                                >
                                    Create account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
    );
}

