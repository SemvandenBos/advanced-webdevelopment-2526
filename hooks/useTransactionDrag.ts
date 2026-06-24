import { useState } from 'react';
import { PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Transaction, Category } from '@/types/models';
import { updateTransaction } from '@/lib/firestore/transactions';
import { isAfterCategoryEndDate, timestampToISO } from '@/lib/dateUtils';

export function useTransactionDrag(
  bookId: string,
  transactions: Transaction[],
  categories: Category[],
) {
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; txId?: string } | undefined;
    if (data?.type === 'transaction') setActiveTxId(data.txId ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTxId(null);
    setDragError(null);
    const { active, over } = event;
    if (!over) return;
    const a = active.data.current as { type: string; txId?: string } | undefined;
    const o = over.data.current as { type: string; categoryId?: string } | undefined;
    if (a?.type === 'transaction' && o?.type === 'category' && a.txId && o.categoryId) {
      const tx = transactions.find(t => t.id === a.txId);
      const category = categories.find(c => c.id === o.categoryId);
      if (tx && category && isAfterCategoryEndDate(timestampToISO(tx.date), category.endDate)) {
        setDragError(`Transactiedatum ligt na de einddatum van categorie "${category.name}".`);
        return;
      }
      updateTransaction(bookId, a.txId, { categoryId: o.categoryId });
    }
  };

  const activeTx = activeTxId ? transactions.find(t => t.id === activeTxId) ?? null : null;

  return { sensors, activeTx, dragError, handleDragStart, handleDragEnd };
}
