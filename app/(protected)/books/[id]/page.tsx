'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { deleteTransaction } from '@/lib/firestore/transactions';
import { useInfiniteTransactions, useMonthlyChartData } from '@/hooks/useTransactions';
import { useCategories, useCategorySpending } from '@/hooks/useCategories';
import { useTransactionDrag } from '@/hooks/useTransactionDrag';
import { Huishoudboekje } from '@/types/models';
import TransactionList from '@/components/transactions/TransactionList';
import CategoryPanel from '@/components/categories/CategoryPanel';
import TransactionDragPreview from '@/components/transactions/TransactionDragPreview';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

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

  const { transactions, loadMore, loading: txLoading, hasMore } = useInfiniteTransactions(id);
  const { data: chartData } = useMonthlyChartData(id);
  const { categories } = useCategories(id);
  const { spending } = useCategorySpending(id);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });
  const { sensors, activeTx, dragError, handleDragStart, handleDragEnd } = useTransactionDrag(id, transactions, categories);

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
    if (inView && hasMore) loadMore();
  }, [inView, transactions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (txId: string) => {
    if (!confirm('Weet je zeker dat je deze transactie wilt verwijderen?')) return;
    await deleteTransaction(id, txId);
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
          <Link href="/books" className={`${secondaryButtonClass} mb-1`}>
            ← Terug naar overzicht
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 truncate">{book.name}</h1>
          {book.description && (
            <p className="text-sm text-gray-500 mt-1">{book.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <Link href={`/books/${id}/edit`} className={secondaryButtonClass}>
              Bewerken
            </Link>
          )}
          <Link href={`/books/${id}/categories`} className={secondaryButtonClass}>
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

      {dragError && <p className="text-sm text-red-600">{dragError}</p>}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Inkomsten en uitgaven</p>
            <TransactionList
              transactions={displayed}
              loading={txLoading}
              hasMore={hasMore}
              selectedCategoryId={selectedCategoryId}
              bookId={id}
              isOwner={isOwner}
              onDelete={handleDelete}
              loadMoreRef={sentinelRef}
            />
          </div>

          <CategoryPanel
            categories={categories}
            spending={spending}
            selectedCategoryId={selectedCategoryId}
            bookId={id}
            isOwner={isOwner}
            onSelect={(catId) => setSelectedCategoryId(prev => (prev === catId ? null : catId))}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTx && <TransactionDragPreview transaction={activeTx} />}
        </DragOverlay>
      </DndContext>

      {chartData.some(m => m.income > 0 || m.expenses > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Inkomsten vs uitgaven laatste 6 maanden
            </h2>
            <MonthlyBarChart data={chartData} />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Verloop laatste 6 maanden
            </h2>
            <MonthlyLineChart data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}
