import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteReview } from '@/app/lib/actions';

export function DeleteReview({ id }: { id: string }) {
  const deleteReviewWithId = deleteReview.bind(null, id);
  return (
    <>
      <form action={deleteReviewWithId}>
        <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
          <span className="sr-only">Delete</span>
          <TrashIcon className="w-4" />
        </button>
      </form>
    </>
  );
}

