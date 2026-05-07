'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormValues {
  amount: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

interface SubmitData {
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  categoryId: string;
}

interface Props {
  initial?: Partial<FormValues>;
  onSubmit: (data: SubmitData) => Promise<void>;
  submitLabel: string;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TransactionForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<FormValues>({
    amount: initial?.amount ?? '',
    description: initial?.description ?? '',
    date: initial?.date ?? todayISO(),
    type: initial?.type ?? 'expense',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const set = (key: keyof FormValues, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Voer een geldig bedrag in (groter dan 0).');
      return;
    }
    if (!form.date) {
      setError('Datum is verplicht.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        amount,
        description: form.description.trim(),
        date: new Date(form.date),
        type: form.type,
        categoryId: '',
      });
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => set('type', 'expense')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.type === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Uitgave
          </button>
          <button
            type="button"
            onClick={() => set('type', 'income')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.type === 'income'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Inkomsten
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bedrag <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
        <input
          type="text"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optionele omschrijving"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
        <input
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Bezig...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:underline"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
