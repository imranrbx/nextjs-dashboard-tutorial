'use client';

import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateOrderStatus, OrderState } from '@/app/lib/actions';
import { useActionState } from 'react';

interface Order {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export default function EditOrderForm({
  order,
}: {
  order: Order;
}) {
  const initialState: OrderState = { message: null, errors: {} };
  const updateOrderStatusWithId = updateOrderStatus.bind(null, order.id);
  const [state, formAction, isPending] = useActionState(updateOrderStatusWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Order Status */}
        <div className="mb-4">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Order Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={order.status}
            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            required
            aria-describedby="status-error"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {state.message && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{state.message}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/orders"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Update Status</Button>
      </div>
    </form>
  );
}

