import { UpdateCoupon, DeleteCoupon } from '@/app/ui/coupons/buttons';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredCoupons } from '@/app/lib/data';

export default async function CouponsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const coupons = await fetchFilteredCoupons(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {coupons?.map((coupon) => (
              <div
                key={coupon.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">{coupon.code}</p>
                    <p className="text-sm text-gray-500">
                      {coupon.discountType} - {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : ''}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-500">{coupon.description || 'No description'}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateToLocal(coupon.createdAt.toString())}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateCoupon id={coupon.id} />
                    <DeleteCoupon id={coupon.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Code
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Discount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Min Order
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Expires
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {coupons?.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="font-medium">{coupon.code}</p>
                    {coupon.description && (
                      <p className="text-xs text-gray-500">{coupon.description}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {coupon.minOrderValue ? formatCurrency(coupon.minOrderValue) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {coupon.expiresAt ? formatDateToLocal(coupon.expiresAt.toString()) : 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(coupon.createdAt.toString())}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateCoupon id={coupon.id} />
                      <DeleteCoupon id={coupon.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

