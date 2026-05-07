import { Skeleton } from '@/components/ui/Skeleton';

export function TransactionRowSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 flex items-center gap-4">
      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
      <div className="flex gap-3 shrink-0">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

interface Props {
  count?: number;
}

export function TransactionListSkeleton({ count = 5 }: Props) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <TransactionRowSkeleton />
        </li>
      ))}
    </ul>
  );
}
