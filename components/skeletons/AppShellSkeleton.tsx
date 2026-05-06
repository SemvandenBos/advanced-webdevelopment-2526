import { Skeleton } from '@/components/ui/Skeleton';
import { BooksListSkeleton } from '@/components/skeletons/BookCardSkeleton';

export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar shape */}
      <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
      </nav>

      {/* Content area shape */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <BooksListSkeleton />
      </main>
    </div>
  );
}
