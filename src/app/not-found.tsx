export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">404 - Not Found</h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">The page you are looking for does not exist.</p>
    </div>
  );
}
