'use client';

import { Transaction } from '@/types';

interface Props {
  transaction: Transaction;
}

export default function TransactionDragPreview({ transaction }: Props) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="bg-white border border-indigo-400 rounded-lg px-5 py-3 flex items-center gap-4 shadow-xl cursor-grabbing select-none opacity-95">
      <span className={`w-2 h-2 rounded-full shrink-0 ${isIncome ? 'bg-green-500' : 'bg-red-400'}`} />
      <p className="text-sm text-gray-800 truncate flex-1">
        {transaction.description || (isIncome ? 'Inkomsten' : 'Uitgave')}
      </p>
      <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(transaction.amount)}
      </span>
    </div>
  );
}
