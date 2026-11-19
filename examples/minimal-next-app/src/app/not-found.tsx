import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-600">The page you requested does not exist.</p>
      <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
