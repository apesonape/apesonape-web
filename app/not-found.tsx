import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-blue">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-4">Page Not Found</h2>
        <Link
          href="/"
          className="bg-black/10 hover:bg-black/20 text-white px-4 py-2 rounded-md transition-colors inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 