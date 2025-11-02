import { DeleteReview } from '@/app/ui/reviews/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchFilteredReviews } from '@/app/lib/data';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ReviewsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const reviews = await fetchFilteredReviews(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {reviews?.map((review) => (
              <div
                key={review.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">{review.user.name}</p>
                    <p className="text-xs text-gray-400">{review.user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{review.product.name}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-700">{review.comment || 'No comment'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateToLocal(review.createdAt.toString())}
                    </p>
                  </div>
                  <DeleteReview id={review.id} />
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  User
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Product
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Rating
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Comment
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {reviews?.map((review) => (
                <tr
                  key={review.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="font-medium">{review.user.name}</p>
                    <p className="text-xs text-gray-500">{review.user.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <p>{review.product.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-xs truncate">
                      {review.comment || 'No comment'}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(review.createdAt.toString())}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <DeleteReview id={review.id} />
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

