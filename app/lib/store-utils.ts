export { formatCurrency } from './currency';

import type { Prisma } from '@/app/generated/prisma';

type StoredImage = {
  url?: string;
  isDefault?: boolean;
};

function isStoredImage(value: unknown): value is StoredImage {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.url === 'string';
}

export function getProductPrimaryImage(images: Prisma.JsonValue): string | null {
  if (!images) return null;
  if (Array.isArray(images)) {
    const normalized = images.filter(isStoredImage);
    const defaultImage = normalized.find((image) => image.isDefault);
    return defaultImage?.url ?? normalized[0]?.url ?? null;
  }

  if (isStoredImage(images)) {
    return images.url ?? null;
  }

  if (typeof images === 'string') {
    return images;
  }

  return null;
}

export function calculateCouponDiscount(
  subtotal: number,
  coupon: {
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue: number | null | undefined;
  } | null,
) {
  if (!coupon) return 0;
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) return 0;
  if (coupon.discountType === 'PERCENTAGE') {
    const pct = Math.max(0, Math.min(100, coupon.discountValue));
    return Math.floor((subtotal * pct) / 100);
  }
  return Math.min(subtotal, Math.max(0, coupon.discountValue));
}