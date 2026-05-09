'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '@/components/CategoryForm';
import { createCategory } from '@/lib/firestore/categories';

export default function NewCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const handleSubmit = async (data: { name: string; maxBudget: number; endDate?: Date }) => {
    await createCategory(id, data);
    router.push(`/books/${id}/categories`);
  };

  return (
    <div>
      <Link
        href={`/books/${id}/categories`}
        className="text-sm text-gray-500 hover:underline block mb-6"
      >
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorie toevoegen</h1>
      <CategoryForm onSubmit={handleSubmit} submitLabel="Toevoegen" />
    </div>
  );
}
