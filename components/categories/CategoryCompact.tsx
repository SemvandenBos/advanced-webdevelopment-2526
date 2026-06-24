'use client';

import { useDroppable } from '@dnd-kit/core';
import { Category } from '@/types/models';
import { formatCurrency } from '@/lib/formatUtils';

interface Props {
  category: Category;
  spent: number;
  onClick: () => void;
  isSelected: boolean;
  isFiltering: boolean;
  isOwner: boolean;
}

export default function CategoryCompact({ category, spent, onClick, isSelected, isFiltering, isOwner }: Props) {
  const pct = category.maxBudget > 0 ? (spent / category.maxBudget) * 100 : 0;
  const barPct = Math.min(pct, 100);
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-green-500';

  const { setNodeRef, isOver } = useDroppable({
    id: `cat-drop-${category.id}`,
    data: { type: 'category', categoryId: category.id },
    disabled: !isOwner,
  });

  const faded = isFiltering && !isSelected;

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={[
        'bg-white border rounded-lg p-3 space-y-2 cursor-pointer select-none transition-all',
        isSelected ? 'border-indigo-400 ring-2 ring-indigo-400' : 'border-gray-200',
        isOver ? 'ring-2 ring-indigo-400 bg-indigo-50' : '',
        faded ? 'opacity-40 grayscale' : '',
      ].join(' ')}
    >
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
        {formatCurrency(spent)} / {formatCurrency(category.maxBudget)}
      </p>
    </div>
  );
}
