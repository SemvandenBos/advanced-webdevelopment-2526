'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { useCategories, useCategorySpending } from '@/hooks/useCategories';
import { deleteCategory } from '@/lib/firestore/categories';
import CategoryCard from '@/components/categories/CategoryCard';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

export default function CategoriesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { categories, loading } = useCategories(id);
  const { spending } = useCategorySpending(id);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    getHuishoudboekje(id).then(book => {
      setIsOwner(!!book && book.ownerUid === user?.uid);
    });
  }, [id, user?.uid]);

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) return;
    await deleteCategory(id, categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/books/${id}`} className={`${secondaryButtonClass} mb-1`}>
            ← Terug naar boek
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Categorieën</h1>
        </div>
        {isOwner && (
          <Link
            href={`/books/${id}/categories/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            + Categorie
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Laden...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">Geen categorieën. Voeg er een toe!</p>
      ) : (
        <ul className="space-y-3">
          {categories.map(cat => (
            <li key={cat.id}>
              <CategoryCard
                category={cat}
                spent={spending.get(cat.id) ?? 0}
                bookId={id}
                onDelete={handleDelete}
                isOwner={isOwner}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
