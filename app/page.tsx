import Link from 'next/link';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import getServerSession from "next-auth";
import { authConfig } from "@/auth.config"
export default async function Page() {
  const session = getServerSession(authConfig)
  const isLoggedIn = !!(await session.auth())?.user;
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Acme Commerce
          </p>
          <h1
            className={`${lusitana.className} text-4xl font-bold text-gray-900 md:text-5xl`}
          >
            A modern shopping experience for thoughtful brands
          </h1>
          <p className="text-lg text-gray-600">
            Browse curated products, personalize your cart, and track every
            order from a unified user dashboard. Built with Next.js App Router and
            Prisma for speed and reliability.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
            >
              Explore the shop
            </Link>

            {isLoggedIn ? <Link
              href="/account/orders"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900"
            >
              View user dashboard
            </Link> : <Link
              href="/login"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900"
            >
              Login
            </Link>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Shop', 'Product detail, rich media, and reviews'],
              ['Cart & checkout', 'Quantity controls and saved addresses'],
              ['Order history', 'Track deliveries and past receipts'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600"
              >
                <p className="text-base font-semibold text-gray-900">{title}</p>
                <p className="mt-1">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-500 p-1 shadow-2xl">
            <div className="rounded-[28px] bg-white/95 p-6">
              <Image
                src="/hero-desktop.png"
                alt="Dashboard preview"
                width={1000}
                height={760}
                className="rounded-3xl border border-gray-100 shadow-lg"
              />
              <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Checkout
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    Saved addresses & secure payments
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Order history
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    Real-time status and receipts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
