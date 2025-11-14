'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Service unavailable
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          We can’t reach the database right now
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Your request didn’t complete because the database connection failed. This usually resolves
          after a quick retry. If it continues, please contact support.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

