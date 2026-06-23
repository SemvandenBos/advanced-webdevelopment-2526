'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CategoryForm from '@/components/CategoryForm';
import { createCategory } from '@/lib/firestore/categories';
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

export default function NewCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getHuishoudboekje(id).then(book => {
      if (!book || book.ownerUid !== user?.uid) router.replace(`/books/${id}/categories`);
    });
  }, [id, user?.uid, router]);

  const handleSubmit = async (data: { name: string; maxBudget: number; endDate?: Date }) => {
    await createCategory(id, data);
    router.push(`/books/${id}/categories`);
  };

  return (
    <div>
      <Link href={`/books/${id}/categories`} className={`${secondaryButtonClass} mb-6`}>
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorie toevoegen</h1>
      <CategoryForm onSubmit={handleSubmit} submitLabel="Toevoegen" />
    </div>
  );
}
