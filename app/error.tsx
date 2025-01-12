'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-blue">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="bg-black/10 hover:bg-black/20 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 