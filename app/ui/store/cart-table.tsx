"use client";
import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Prisma } from '@/app/generated/prisma';
import {
  formatCurrency,
  getProductPrimaryImage,
  calculateCouponDiscount,
} from '@/app/lib/store-utils';
import {
  removeCartItem,
  updateCartQuantity,
} from '@/app/lib/store-actions';
import { applyCouponToCart, removeCouponFromCart } from '@/app/lib/store-actions';

type CartItem = {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  variantSelections?: Prisma.JsonValue | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Prisma.JsonValue;
  } | null;
};

type CartTableProps = {
  items: CartItem[];
  coupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue: number | null;
  } | null;
};

function buildSelectionLabel(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) return null;

  const labels = value
    .map((selection) => {
      if (!selection || typeof selection !== 'object') return null;
      const record = selection as Record<string, unknown>;
      const optionValue = record.value;
      if (!optionValue) return null;
      const optionName = typeof record.name === 'string' ? record.name : null;
      return optionName ? `${optionName}: ${optionValue}` : String(optionValue);
    })
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? labels.join(', ') : null;
}

export function CartTable({ items, coupon }: CartTableProps) {
  const router = useRouter();
  type CouponActionState = { success: boolean; message: string };
  async function applyWrapper(prev: CouponActionState, formData: FormData): Promise<CouponActionState> {
    const res = await applyCouponToCart(formData);
    const state = (res ?? { success: false, message: '' }) as CouponActionState;
    return state;
  }
  async function removeWrapper(prev: CouponActionState, _formData: FormData): Promise<CouponActionState> {
    const res = await removeCouponFromCart();
    const state = (res ?? { success: false, message: '' }) as CouponActionState;
    return state;
  }
  const [applyState, applyAction] = useActionState<CouponActionState, FormData>(applyWrapper, { success: false, message: '' });
  const [removeState, removeAction] = useActionState<CouponActionState, FormData>(removeWrapper, { success: false, message: '' });
  useEffect(() => {
    if (applyState?.success || removeState?.success) {
      router.refresh();
    }
  }, [applyState?.success, removeState?.success, router]);
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
        <p className="mt-2 text-sm text-gray-500">
          Add products from the shop to see them here.
        </p>
      </div>
    );
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const discount = calculateCouponDiscount(subtotal, coupon ?? null);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {items.map((item) => {
          const imageSrc =
            (item.product && getProductPrimaryImage(item.product.images)) ??
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%23EEF2FF"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2352567B" font-size="20">Image coming soon</text></svg>';
          const lineTotal = item.price * item.quantity;
          const selectionLabel = buildSelectionLabel(item.variantSelections ?? null);

          return (
            <li key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              {item.product ? (
                <Link
                  href={`/product/${item.product.slug}`}
                  className="relative h-28 w-28 overflow-hidden rounded-xl bg-gray-100"
                >
                  <Image
                    src={imageSrc}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>
              ) : (
                <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-gray-100" />
              )}
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {item.product ? (
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="text-base font-semibold text-gray-900"
                    >
                      {item.product.name}
                    </Link>
                  ) : (
                    <p className="text-base font-semibold text-gray-900">
                      Product unavailable
                    </p>
                  )}
                  {selectionLabel && (
                    <p className="text-xs text-gray-500">Options: {selectionLabel}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Unit price: {formatCurrency(item.price)}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Line total: {formatCurrency(lineTotal)}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <form
                    action={updateCartQuantity}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <label className="text-sm text-gray-600">
                      Qty
                      <input
                        type="number"
                        name="quantity"
                        min={1}
                        max={10}
                        defaultValue={item.quantity}
                        className="ml-2 w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:border-gray-400"
                    >
                      Update
                    </button>
                  </form>
                  <form action={removeCartItem}>
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
          <p>Subtotal</p>
          <p>{formatCurrency(subtotal)}</p>
        </div>
        {(applyState?.message || removeState?.message) ? (
          <div className={`rounded-md p-3 text-sm ${ (applyState?.success || removeState?.success) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' }`}>
            <p>{applyState?.message || removeState?.message}</p>
          </div>
        ) : null}
        {coupon ? (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">{coupon.code}</span>
              <span className="text-gray-600">applied</span>
            </div>
            <form action={removeAction}>
              <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-500">Remove</button>
            </form>
          </div>
        ) : (
          <form action={applyAction} className="flex items-center gap-2">
            <input
              type="text"
              name="code"
              placeholder="Coupon code"
              className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Apply
            </button>
          </form>
        )}
        {discount > 0 ? (
          <div className="flex items-center justify-between text-base">
            <p className="text-gray-700">Discount</p>
            <p className="font-semibold text-green-700">- {formatCurrency(discount)}</p>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-lg font-semibold text-gray-900">
          <p>Total</p>
          <p>{formatCurrency(total)}</p>
        </div>
        <p className="text-sm text-gray-500">
          Taxes and shipping will be calculated at checkout.
        </p>
      </div>
    </div>
  );
}

