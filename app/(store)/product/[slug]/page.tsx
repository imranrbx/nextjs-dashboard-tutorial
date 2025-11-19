import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  formatCurrency,
  getProductBySlug,
  getProductPrimaryImage,
} from '@/app/lib/store-service';
import { AddToCartButton } from '@/app/ui/store/add-to-cart-button';
import { VariableProductOptions } from '@/app/ui/store/variable-product-options';

type ProductPageProps = {
 slug: string ;
};

type ProductWithRelations = Awaited<ReturnType<typeof getProductBySlug>>;

function resolvePrice(product: ProductWithRelations) {
  if (!product) return 0;
  if (product.price > 0) return product.price;
  if (product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((variant) => variant.price));
}

export default async function ProductPage({params}: {params: Promise<ProductPageProps>}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = resolvePrice(product);
  const primaryImage =
    getProductPrimaryImage(product.images) ??
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%23EEF2FF"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2352567B" font-size="20">Image coming soon</text></svg>';
  const reviewCount = product.reviews.length;
  const rating =
    reviewCount > 0
      ? (
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviewCount
      ).toFixed(1)
      : null;
  const hasInventory =
    product.stock > 0 || product.variants.some((variant) => variant.stock > 0);
  const isOutOfStock = !hasInventory;
  const addToCartFormId = `add-to-cart-${product.id}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        {product.description && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Product story</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {product.description}
            </p>
          </div>
        )}
      </div>

      <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          {product.brand?.name || 'Acme'}
        </p>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-sm text-gray-500">
          {product.category?.name ? `Category: ${product.category.name}` : '—'}
        </p>

        {product.productType === 'VARIABLE' ? (
          <VariableProductOptions
            basePrice={product.price}
            variants={product.variants}
            rating={rating}
            reviewCount={reviewCount}
            formId={addToCartFormId}
          />
        ) : (
          <div className="flex items-center gap-6">
            <p className="text-3xl font-semibold text-gray-900">
              {formatCurrency(price)}
            </p>
            {rating && (
              <p className="text-sm text-gray-600">
                ⭐ {rating} ({reviewCount} reviews)
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          {isOutOfStock ? (
            <p className="text-red-600">Currently out of stock.</p>
          ) : (
            <p>
              <span className="font-semibold text-green-600">In stock</span> —
              ships in 2-3 business days.
            </p>
          )}
        </div>

        {!isOutOfStock && (
          <AddToCartButton
            productId={product.id}
            className="w-full"
            formId={addToCartFormId}
          />
        )}
      </aside>
    </div>
  );
}

