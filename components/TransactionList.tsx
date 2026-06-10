'use client';

import { Fragment } from 'react';
import { Transaction } from '@/types';
import TransactionRow from '@/components/TransactionRow';
import { TransactionListSkeleton } from '@/components/skeletons/TransactionSkeleton';

interface Props {
  transactions: Transaction[];
  loading: boolean;
  selectedCategoryId: string | null;
  bookId: string;
  isOwner: boolean;
  onDelete: (txId: string) => void;
  loadMoreRef: React.Ref<HTMLDivElement>;
}

export default function TransactionList({
  transactions,
  loading,
  selectedCategoryId,
  bookId,
  isOwner,
  onDelete,
  loadMoreRef,
}: Props) {
  if (loading) return <TransactionListSkeleton />;

  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        {selectedCategoryId ? 'Geen transacties in deze categorie.' : 'Geen transacties.'}
      </p>
    );
  }

  return (
    <ul className="space-y-3 max-h-140 overflow-y-auto pr-1">
      {transactions.map((tx, i) => {
        const txDate = tx.date.toDate();
        const prev = transactions[i - 1];
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
                bookId={bookId}
                onDelete={onDelete}
                isOwner={isOwner}
              />
            </li>
          </Fragment>
        );
      })}
      <li>
        <div ref={loadMoreRef} className="h-4" />
      </li>
    </ul>
  );
}
