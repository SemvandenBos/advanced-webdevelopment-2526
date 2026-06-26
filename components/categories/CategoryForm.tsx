'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';
import { isPastISODate } from '@/lib/dateUtils';
import type { CategoryFormValues, CategorySubmitData } from '@/types/forms';

interface Props {
  initial?: { name?: string; maxBudget?: string; endDate?: string };
  onSubmit: (data: CategorySubmitData) => Promise<void>;
  submitLabel: string;
}

export default function CategoryForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<CategoryFormValues>({
    name: initial?.name ?? '',
    maxBudget: initial?.maxBudget ?? '',
    endDate: initial?.endDate ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const set = (key: keyof CategoryFormValues, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Naam is verplicht.');
      return;
    }
    const maxBudget = parseFloat(form.maxBudget.replace(',', '.'));
    if (!form.maxBudget || isNaN(maxBudget) || maxBudget <= 0) {
      setError('Voer een geldig maximaal budget in (groter dan 0).');
      return;
    }
    if (form.endDate && isPastISODate(form.endDate)) {
      setError('Einddatum mag niet in het verleden liggen.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        maxBudget,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
      });
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Naam <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="bijv. Boodschappen"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximaal budget <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.maxBudget}
            onChange={e => set('maxBudget', e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Einddatum <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <input
          type="date"
          value={form.endDate}
          onChange={e => set('endDate', e.target.value)}
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
          className={secondaryButtonClass}
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
