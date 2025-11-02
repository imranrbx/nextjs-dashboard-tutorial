"use client";
import Link from 'next/link';
import { TicketIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createCoupon, CouponState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function CreateCouponForm() {
  const initialState: CouponState = { errors: {}, message: null };
  const [state, formAction, isPending] = useActionState(createCoupon, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Code */}
        <div className="mb-4">
          <label htmlFor="code" className="mb-2 block text-sm font-medium">
            Coupon Code
          </label>
          <div className="relative">
            <input
              id="code"
              name="code"
              type="text"
              placeholder="SAVE20"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 uppercase"
              required
              aria-describedby="code-error"
            />
            <TicketIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="code-error" aria-live="polite" aria-atomic="true">
            {state.errors?.code &&
              state.errors.code.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Enter coupon description"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Discount Type */}
        <div className="mb-4">
          <label htmlFor="discountType" className="mb-2 block text-sm font-medium">
            Discount Type
          </label>
          <select
            id="discountType"
            name="discountType"
            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            required
            aria-describedby="discountType-error"
          >
            <option value="">Select discount type</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
          <div id="discountType-error" aria-live="polite" aria-atomic="true">
            {state.errors?.discountType &&
              state.errors.discountType.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Discount Value */}
        <div className="mb-4">
          <label htmlFor="discountValue" className="mb-2 block text-sm font-medium">
            Discount Value
          </label>
          <input
            id="discountValue"
            name="discountValue"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            required
            aria-describedby="discountValue-error"
          />
          <div id="discountValue-error" aria-live="polite" aria-atomic="true">
            {state.errors?.discountValue &&
              state.errors.discountValue.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Min Order Value */}
        <div className="mb-4">
          <label htmlFor="minOrderValue" className="mb-2 block text-sm font-medium">
            Minimum Order Value (Optional)
          </label>
          <input
            id="minOrderValue"
            name="minOrderValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Is Active */}
        <div className="mb-4">
          <label className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>

        {/* Expires At */}
        <div className="mb-4">
          <label htmlFor="expiresAt" className="mb-2 block text-sm font-medium">
            Expiration Date (Optional)
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {state.message && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{state.message}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/coupons"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Create Coupon</Button>
      </div>
    </form>
  );
}

