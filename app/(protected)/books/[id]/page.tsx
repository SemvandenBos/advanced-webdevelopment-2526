'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/books" className="text-sm text-gray-500 hover:underline">
          ← Terug naar overzicht
        </Link>
      </div>
      <p className="text-sm text-gray-400">Boekje {id} — transacties komen hier (Epic 2).</p>
    </div>
  );
}
