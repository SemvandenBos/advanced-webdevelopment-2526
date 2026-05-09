'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getTransaction, updateTransaction } from '@/lib/firestore/transactions';
import TransactionForm from '@/components/TransactionForm';
import { Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';

export default function EditTransactionPage() {
  const { id, txId } = useParams<{ id: string; txId: string }>();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories(id);

  useEffect(() => {
    getTransaction(id, txId).then(data => {
      setTx(data);
      setLoading(false);
    });
  }, [id, txId]);

  if (loading) return <p className="text-sm text-gray-400">Laden...</p>;
  if (!tx) return <p className="text-sm text-red-500">Transactie niet gevonden.</p>;

  const dateISO = (() => {
    const d = tx.date.toDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const handleSubmit = async (data: {
    amount: number;
    description: string;
    date: Date;
    type: 'income' | 'expense';
    categoryId: string;
  }) => {
    await updateTransaction(id, txId, data);
    router.push(`/books/${id}`);
  };

  return (
    <div>
      <Link href={`/books/${id}`} className="text-sm text-gray-500 hover:underline block mb-6">
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactie bewerken</h1>
      <TransactionForm
        initial={{
          amount: String(tx.amount),
          description: tx.description,
          date: dateISO,
          type: tx.type,
          categoryId: tx.categoryId ?? '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Opslaan"
        categories={categories}
      />
    </div>
  );
}
