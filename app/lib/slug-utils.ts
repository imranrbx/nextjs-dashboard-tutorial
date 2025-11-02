import prisma from './prisma';

/**
 * Generate a slug from a string (title/name)
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if slug exists in Category table
 */
export async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.category.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!existing;
}

/**
 * Check if slug exists in Brand table
 */
export async function brandSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.brand.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!existing;
}

/**
 * Check if slug exists in Product table
 */
export async function productSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.product.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!existing;
}

/**
 * Generate a unique slug for Category
 * If slug exists, appends incremental number or random string
 */
export async function generateUniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // If slug is empty (e.g., only special chars), use a default
  if (!slug) {
    slug = 'category';
  }

  while (await categorySlugExists(slug, excludeId)) {
    // Try incremental approach first (slug-1, slug-2, etc.)
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Fallback to random string if counter gets too high (unlikely but safe)
    if (counter > 1000) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      break;
    }
  }

  return slug;
}

/**
 * Generate a unique slug for Brand
 * If slug exists, appends incremental number or random string
 */
export async function generateUniqueBrandSlug(name: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // If slug is empty (e.g., only special chars), use a default
  if (!slug) {
    slug = 'brand';
  }

  while (await brandSlugExists(slug, excludeId)) {
    // Try incremental approach first (slug-1, slug-2, etc.)
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Fallback to random string if counter gets too high
    if (counter > 1000) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      break;
    }
  }

  return slug;
}

/**
 * Generate a unique slug for Product
 * If slug exists, appends incremental number or random string
 */
export async function generateUniqueProductSlug(name: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // If slug is empty (e.g., only special chars), use a default
  if (!slug) {
    slug = 'product';
  }

  while (await productSlugExists(slug, excludeId)) {
    // Try incremental approach first (slug-1, slug-2, etc.)
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Fallback to random string if counter gets too high
    if (counter > 1000) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      break;
    }
  }

  return slug;
}

