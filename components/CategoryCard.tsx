import Link from 'next/link';
import { Category } from '@/types';

interface Props {
  category: Category;
  spent: number;
  bookId: string;
  onDelete: (id: string) => void;
}

function fmt(amount: number) {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
}

export default function CategoryCard({ category, spent, bookId, onDelete }: Props) {
  const pct = category.maxBudget > 0 ? (spent / category.maxBudget) * 100 : 0;
  const barPct = Math.min(pct, 100);

  const barColor =
    pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500';

  const endDateLabel = category.endDate
    ? category.endDate.toDate().toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{category.name}</p>
          {endDateLabel && (
            <p className="text-xs text-gray-400 mt-0.5">t/m {endDateLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-sm">
          <Link
            href={`/books/${bookId}/categories/${category.id}/edit`}
            className="text-gray-500 hover:underline"
          >
            Bewerken
          </Link>
          <button
            onClick={() => onDelete(category.id)}
            className="text-red-500 hover:underline"
          >
            Verwijderen
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{fmt(spent)} uitgegeven</span>
          <span className="text-gray-400">max {fmt(category.maxBudget)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      {pct >= 100 && (
        <p className="text-xs font-medium text-red-600">Over budget</p>
      )}
      {pct >= 80 && pct < 100 && (
        <p className="text-xs font-medium text-yellow-600">Let op: bijna op</p>
      )}
    </div>
  );
}
