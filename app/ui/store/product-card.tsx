import type { Prisma } from '@/app/generated/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { AddToCartButton } from './add-to-cart-button';
import {
  formatCurrency,
  getProductPrimaryImage,
} from '@/app/lib/store-service';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    variants: { price: number; stock: number }[];
    images: Prisma.JsonValue;
    reviews?: { rating: number }[];
    brand?: { name: string | null } | null;
    category?: { name: string | null } | null;
  };
};

function resolveDisplayPrice(product: ProductCardProps['product']) {
  if (product.price > 0) return product.price;
  if (product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((variant) => variant.price));
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%23EEF2FF"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2352567B" font-size="20">Image coming soon</text></svg>';

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductPrimaryImage(product.images) ?? FALLBACK_IMAGE;
  const price = resolveDisplayPrice(product);
  const reviewCount = product.reviews?.length ?? 0;
  const hasInventory =
    product.stock > 0 || product.variants.some((variant) => variant.stock > 0);
  const isOutOfStock = !hasInventory;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-50"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            {[product.brand?.name, product.category?.name]
              .filter(Boolean)
              .join(' • ')}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="text-base font-semibold text-gray-900"
          >
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm text-gray-600">
            {product.description ?? 'No description available.'}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(price)}
            </p>
            <p className="text-xs text-gray-500">{reviewCount} reviews</p>
          </div>
          {!isOutOfStock && <AddToCartButton productId={product.id} />}
        </div>
        {isOutOfStock && (
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Out of stock
          </p>
        )}
      </div>
    </div>
  );
}

