import { Skeleton } from '@/components/ui/Skeleton';

export function BookCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

interface Props {
  count?: number;
}

export function BooksListSkeleton({ count = 3 }: Props) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <BookCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
