import Link from 'next/link';
import { addToCart } from '@/app/lib/store-actions';
import { getCurrentUser } from '@/app/lib/store-service';
import { SubmitButton } from './submit-button';

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  disabled?: boolean;
  formId?: string;
};

export async function AddToCartButton({
  productId,
  className,
  disabled = false,
  formId,
}: AddToCartButtonProps) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-1">
        <Link
          href="/login"
          className={`inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-gray-400 ${className ?? ''}`}
        >
          Log in to buy
        </Link>
        <p className="text-xs text-gray-500">
          Please sign in to add this item to your cart.
        </p>
      </div>
    );
  }

  return (
    <form action={addToCart} id={formId}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <SubmitButton
        pendingLabel="Adding..."
        className={className}
        disabled={disabled}
      >
        Add to cart
      </SubmitButton>
    </form>
  );
}

