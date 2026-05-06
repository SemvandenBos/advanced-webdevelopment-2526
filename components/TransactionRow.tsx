'use client';

import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Transaction } from '@/types';

function fmt(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
}

function fmtDate(ts: Timestamp) {
  return ts.toDate().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

interface Props {
  transaction: Transaction;
  bookId: string;
  onDelete: (id: string) => void;
}

export default function TransactionRow({ transaction: tx, bookId, onDelete }: Props) {
  const isIncome = tx.type === 'income';

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 flex items-center gap-4">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${isIncome ? 'bg-green-500' : 'bg-red-400'}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">
          {tx.description || (isIncome ? 'Inkomsten' : 'Uitgave')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}{fmt(tx.amount)}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/books/${bookId}/transactions/${tx.id}/edit`}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Bewerken
        </Link>
        <button
          onClick={() => onDelete(tx.id)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Verwijderen
        </button>
      </div>
    </div>
  );
}
