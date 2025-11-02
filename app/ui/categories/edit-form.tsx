'use client';

import { TagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCategory, CategoryState } from '@/app/lib/actions';
import { useActionState, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// Client-side slug generation function (matches server-side logic)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditCategoryForm({
  category,
}: {
  category: Category;
}) {
  const initialState: CategoryState = { message: null, errors: {} };
  const updateCategoryWithId = updateCategory.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(updateCategoryWithId, initialState);
  const [slugPreview, setSlugPreview] = useState(category.slug);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = generateSlug(name);
    setSlugPreview(generatedSlug || category.slug);
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Category Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Category Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={category.name}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              required
              onChange={handleNameChange}
              aria-describedby="name-error"
            />
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
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
              defaultValue={category.slug}
              className="peer block w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              readOnly
              aria-describedby="slug-info"
            />
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <p id="slug-info" className="mt-1 text-xs text-gray-500">
            Slug is automatically generated from the category name. It will update when you change the name.
          </p>
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
            defaultValue={category.description || ''}
            placeholder="Enter category description"
            className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="description-error"
          />
          <div id="description-error" aria-live="polite" aria-atomic="true">
            {state.errors?.description &&
              state.errors.description.map((error: string) => (
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
          href="/dashboard/categories"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Update Category</Button>
      </div>
    </form>
  );
}

