import { Category } from '@/types';

interface Props {
  category: Category;
  spent: number;
}

function fmt(amount: number) {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
}

export default function CategoryCompact({ category, spent }: Props) {
  const pct = category.maxBudget > 0 ? (spent / category.maxBudget) * 100 : 0;
  const barPct = Math.min(pct, 100);

  const barColor =
    pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-gray-900 text-sm truncate">{category.name}</p>
        {pct >= 100 && (
          <span className="text-xs font-medium text-red-600 shrink-0">Over budget</span>
        )}
        {pct >= 80 && pct < 100 && (
          <span className="text-xs font-medium text-yellow-600 shrink-0">Bijna op</span>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <p className="text-xs text-gray-400">
        {fmt(spent)} / {fmt(category.maxBudget)}
      </p>
    </div>
  );
}
