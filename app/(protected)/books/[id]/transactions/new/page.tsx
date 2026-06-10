'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TransactionForm from '@/components/TransactionForm';
import { createTransaction } from '@/lib/firestore/transactions';
import { useCategories } from '@/hooks/useCategories';
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes';

export default function NewTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { categories } = useCategories(id);

  useEffect(() => {
    getHuishoudboekje(id).then(book => {
      if (!book || book.ownerUid !== user?.uid) router.replace(`/books/${id}`);
    });
  }, [id, user?.uid, router]);

  const handleSubmit = async (data: {
    amount: number;
    description: string;
    date: Date;
    type: 'income' | 'expense';
    categoryId: string;
  }) => {
    if (!user) return;
    await createTransaction(id, user.uid, data);
    router.push(`/books/${id}`);
  };

  return (
    <div>
      <Link href={`/books/${id}`} className="text-sm text-gray-500 hover:underline block mb-6">
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactie toevoegen</h1>
      <TransactionForm onSubmit={handleSubmit} submitLabel="Toevoegen" categories={categories} />
    </div>
  );
}
