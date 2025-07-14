import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { msg } = await searchParams;

  return (
    <div className="bg-red-100 rounded-lg shadow-md p-8 text-center">
      <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
      <p className="text-red-600 mb-4">{msg}</p>
      <Link
        href="/"
        className="inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Go back to Home
      </Link>
    </div>
  );
}
