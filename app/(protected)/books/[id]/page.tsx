'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { deleteTransaction, updateTransaction } from '@/lib/firestore/transactions';
import { useInfiniteTransactions, useMonthlyChartData } from '@/hooks/useTransactions';
import { useCategories, useCategorySpending } from '@/hooks/useCategories';
import { Huishoudboekje } from '@/types';
import TransactionRow from '@/components/TransactionRow';
import CategoryCompact from '@/components/CategoryCompact';
import { TransactionListSkeleton } from '@/components/skeletons/TransactionSkeleton';

const MonthlyLineChart = dynamic(
  () => import('@/components/charts/MonthlyLineChart'),
  { ssr: false }
);

const MonthlyBarChart = dynamic(
  () => import('@/components/charts/MonthlyBarChart'),
  { ssr: false }
);

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [book, setBook] = useState<Huishoudboekje | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { transactions, loadMore, loading: txLoading } = useInfiniteTransactions(id);
  const { data: chartData } = useMonthlyChartData(id);
  const { categories } = useCategories(id);
  const { spending } = useCategorySpending(id);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    getHuishoudboekje(id).then(data => {
      if (!data || data.archived) {
        router.replace('/books');
        return;
      }
      setBook(data);
      setBookLoading(false);
    });
  }, [id, router]);

  useEffect(() => {
    if (inView) loadMore();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (txId: string) => {
    if (!confirm('Weet je zeker dat je deze transactie wilt verwijderen?')) return;
    await deleteTransaction(id, txId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const a = active.data.current as { type: string; txId?: string } | undefined;
    const o = over.data.current as { type: string; categoryId?: string } | undefined;
    if (a?.type === 'transaction' && o?.type === 'category' && a.txId && o.categoryId) {
      updateTransaction(id, a.txId, { categoryId: o.categoryId });
    }
  };

  if (bookLoading) {
    return <p className="text-sm text-gray-400">Laden...</p>;
  }

  if (!book) return null;

  const isOwner = book.ownerUid === user?.uid;
  const displayed = selectedCategoryId
    ? transactions.filter(tx => tx.categoryId === selectedCategoryId)
    : transactions;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/books" className="text-sm text-gray-500 hover:underline block mb-1">
            ← Terug naar overzicht
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 truncate">{book.name}</h1>
          {book.description && (
            <p className="text-sm text-gray-500 mt-1">{book.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isOwner && (
            <Link href={`/books/${id}/edit`} className="text-sm text-gray-500 hover:underline">
              Bewerken
            </Link>
          )}
          <Link href={`/books/${id}/categories`} className="text-sm text-gray-500 hover:underline">
            Categorieën
          </Link>
          {isOwner && (
            <Link
              href={`/books/${id}/transactions/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Transactie
            </Link>
          )}
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Inkomsten en uitgaven</p>
            {txLoading ? (
              <TransactionListSkeleton />
            ) : displayed.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {selectedCategoryId ? 'Geen transacties in deze categorie.' : 'Geen transacties.'}
              </p>
            ) : (
              <ul className="space-y-3 max-h-140 overflow-y-auto pr-1">
                {displayed.map((tx, i) => {
                  const txDate = tx.date.toDate();
                  const prev = displayed[i - 1];
                  const showHeader =
                    i === 0 ||
                    txDate.getMonth() !== prev.date.toDate().getMonth() ||
                    txDate.getFullYear() !== prev.date.toDate().getFullYear();
                  const headerLabel = txDate.toLocaleDateString('nl-NL', {
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <Fragment key={tx.id}>
                      {showHeader && (
                        <li className="pt-1 first:pt-0">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                            {headerLabel}
                          </p>
                        </li>
                      )}
                      <li>
                        <TransactionRow
                          transaction={tx}
                          bookId={id}
                          onDelete={handleDelete}
                          isOwner={isOwner}
                        />
                      </li>
                    </Fragment>
                  );
                })}
                <li>
                  <div ref={sentinelRef} className="h-4" />
                </li>
              </ul>
            )}
          </div>

          <div className="md:col-span-2 md:sticky md:top-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Categorieën</p>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-400">
                Geen categorieën.{' '}
                <Link href={`/books/${id}/categories`} className="underline hover:text-gray-600">
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
                      onClick={() =>
                        setSelectedCategoryId(prev => (prev === cat.id ? null : cat.id))
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DndContext>

      {chartData.some(m => m.income > 0 || m.expenses > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Inkomsten vs uitgaven — laatste 6 maanden
            </h2>
            <MonthlyBarChart data={chartData} />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Verloop — laatste 6 maanden
            </h2>
            <MonthlyLineChart data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}
