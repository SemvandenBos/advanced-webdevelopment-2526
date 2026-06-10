'use client';

import Link from 'next/link';
import { Category } from '@/types';
import CategoryCompact from '@/components/CategoryCompact';

interface Props {
  categories: Category[];
  spending: Map<string, number>;
  selectedCategoryId: string | null;
  bookId: string;
  onSelect: (categoryId: string) => void;
}

export default function CategoryPanel({
  categories,
  spending,
  selectedCategoryId,
  bookId,
  onSelect,
}: Props) {
  return (
    <div className="md:col-span-2 md:sticky md:top-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Categorieën</p>
      {categories.length === 0 ? (
        <p className="text-xs text-gray-400">
          Geen categorieën.{' '}
          <Link href={`/books/${bookId}/categories`} className="underline hover:text-gray-600">
            Voeg er een toe
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3 max-h-140 overflow-y-auto pr-1">
          {categories.map(cat => (
            <li key={cat.id}>
              <CategoryCompact
                category={cat}
                spent={spending.get(cat.id) ?? 0}
                isSelected={cat.id === selectedCategoryId}
                isFiltering={selectedCategoryId !== null}
                onClick={() => onSelect(cat.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
