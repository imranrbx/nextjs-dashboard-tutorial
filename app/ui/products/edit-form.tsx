'use client';

import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateProduct, ProductState } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import ImageUpload from './image-upload';
import VariationsForm from './variations-form';

// Client-side slug generation function (matches server-side logic)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CategoryField {
  id: string;
  name: string;
}

interface BrandField {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: any;
  categoryId: string | null;
  brandId: string | null;
  productType: string;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  variants?: any[];
}

export default function EditProductForm({
  product,
  categories,
  brands,
}: {
  product: Product;
  categories: CategoryField[];
  brands: BrandField[];
}) {
  const initialState: ProductState = { message: null, errors: {} };
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateProductWithId, initialState);
  const [slugPreview, setSlugPreview] = useState(product.slug);
  const [productType, setProductType] = useState(product.productType || 'SIMPLE');
  const [variations, setVariations] = useState(product.variants || []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = generateSlug(name);
    setSlugPreview(generatedSlug || product.slug);
  };

  // Parse existing images - handle both string array and object array formats
  const parseExistingImages = () => {
    if (!product.images) return [];
    
    try {
      // If images is already an array
      if (Array.isArray(product.images)) {
        return product.images.map((img: any) => {
          // If it's a string, convert to object
          if (typeof img === 'string') {
            return { url: img, isDefault: false };
          }
          // If it's already an object
          return { url: img.url || img, isDefault: img.isDefault || false };
        });
      }
      // If it's a string, try to parse it
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          return parsed.map((img: any) => {
            if (typeof img === 'string') {
              return { url: img, isDefault: false };
            }
            return { url: img.url || img, isDefault: img.isDefault || false };
          });
        }
      }
    } catch (error) {
      console.error('Error parsing images:', error);
    }
    return [];
  };

  const existingImages = parseExistingImages();

  return (
    <form action={formAction}>
        <input type="hidden" name="variations" value={JSON.stringify(variations)} />
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Product Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={product.name}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              required
              onChange={handleNameChange}
              aria-describedby="name-error"
            />
            <ShoppingBagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">Slug preview:</span>
            <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border">
              {slugPreview}
            </code>
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Slug - Auto-generated from name, shown as read-only */}
        <div className="mb-4">
          <label htmlFor="slug" className="mb-2 block text-sm font-medium">
            Slug <span className="text-xs text-gray-500">(auto-generated)</span>
          </label>
          <div className="relative">
            <input
              id="slug"
              name="slug"
              type="text"
              value={slugPreview}
              className="peer block w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              readOnly
              aria-describedby="slug-info"
            />
            <ShoppingBagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <p id="slug-info" className="mt-1 text-xs text-gray-500">
            Slug is automatically generated from the product name. It will update when you change the name.
          </p>
        </div>

        {/* Product Type */}
        <div className="mb-4">
          <label htmlFor="productType" className="mb-2 block text-sm font-medium">
            Product Type
          </label>
          <select
            id="productType"
            name="productType"
            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="SIMPLE">Simple Product</option>
            <option value="VARIABLE">Variable Product</option>
          </select>
        </div>

        {productType === 'SIMPLE' && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="price-error"
              />
              <div id="price-error" aria-live="polite" aria-atomic="true">
                {state.errors?.price &&
                  state.errors.price.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
            <div>
              <label htmlFor="stock" className="mb-2 block text-sm font-medium">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product.stock}
                className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="stock-error"
              />
              <div id="stock-error" aria-live="polite" aria-atomic="true">
                {state.errors?.stock &&
                  state.errors.stock.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}

        {productType === 'VARIABLE' && <VariationsForm variations={variations} setVariations={setVariations} />}

        {/* Category and Brand */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="mb-2 block text-sm font-medium">
              Category (Optional)
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product.categoryId || ''}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brandId" className="mb-2 block text-sm font-medium">
              Brand (Optional)
            </label>
            <select
              id="brandId"
              name="brandId"
              defaultValue={product.brandId || ''}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
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
            rows={4}
            defaultValue={product.description || ''}
            placeholder="Enter product description"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Images Upload */}
        <ImageUpload existingImages={existingImages} />
        
        <div id="images-error" aria-live="polite" aria-atomic="true">
          {state.errors?.images &&
            state.errors.images.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {state.message && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{state.message}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/products"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Update Product</Button>
      </div>
    </form>
  );
}

