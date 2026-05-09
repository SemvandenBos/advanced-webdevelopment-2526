'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '@/components/CategoryForm';
import { getCategory, updateCategory } from '@/lib/firestore/categories';
import { Category } from '@/types';

function toDateInput(cat: Category): string {
  if (!cat.endDate) return '';
  const d = cat.endDate.toDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EditCategoryPage() {
  const { id, categoryId } = useParams<{ id: string; categoryId: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategory(id, categoryId).then(data => {
      setCategory(data);
      setLoading(false);
    });
  }, [id, categoryId]);

  const handleSubmit = async (data: { name: string; maxBudget: number; endDate?: Date }) => {
    await updateCategory(id, categoryId, {
      name: data.name,
      maxBudget: data.maxBudget,
      endDate: data.endDate ?? null,
    });
    router.push(`/books/${id}/categories`);
  };

  if (loading) return <p className="text-sm text-gray-400">Laden...</p>;
  if (!category) return <p className="text-sm text-red-600">Categorie niet gevonden.</p>;

  return (
    <div>
      <Link
        href={`/books/${id}/categories`}
        className="text-sm text-gray-500 hover:underline block mb-6"
      >
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorie bewerken</h1>
      <CategoryForm
        initial={{
          name: category.name,
          maxBudget: String(category.maxBudget),
          endDate: toDateInput(category),
        }}
        onSubmit={handleSubmit}
        submitLabel="Opslaan"
      />
    </div>
  );
}
