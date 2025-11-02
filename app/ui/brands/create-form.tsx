"use client";
import Link from 'next/link';
import { FolderIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createBrand, BrandState } from '@/app/lib/actions';
import { useActionState, useState } from 'react';

// Client-side slug generation function (matches server-side logic)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateBrandForm() {
  const initialState: BrandState = { errors: {}, message: null };
  const [state, formAction, isPending] = useActionState(createBrand, initialState);
  const [slugPreview, setSlugPreview] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = generateSlug(name);
    setSlugPreview(generatedSlug || '');
  };

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Brand Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Brand Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter brand name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              required
              onChange={handleNameChange}
              aria-describedby="name-error"
            />
            <FolderIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {slugPreview && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-gray-500">Slug preview:</span>
              <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border">
                {slugPreview}
              </code>
            </div>
          )}
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Slug - Auto-generated from name, hidden */}
        <input type="hidden" name="slug" value="" />

        {state.message && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{state.message}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/brands"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Create Brand</Button>
      </div>
    </form>
  );
}

