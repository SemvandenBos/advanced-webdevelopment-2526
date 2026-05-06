'use client';

import Link from 'next/link';
import { useHuishoudboekjes } from '@/hooks/useHuishoudboekjes';
import { useAuth } from '@/contexts/AuthContext';
import HuishoudboekjeCard from '@/components/HuishoudboekjeCard';
import { BooksListSkeleton } from '@/components/skeletons/BookCardSkeleton';
import { archiveHuishoudboekje } from '@/lib/firestore/huishoudboekjes';

export default function BooksPage() {
  const { books, loading } = useHuishoudboekjes();
  const { user } = useAuth();

  const handleArchive = async (id: string) => {
    await archiveHuishoudboekje(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijn huishoudboekjes</h1>
        <div className="flex items-center gap-4">
          <Link href="/books/archived" className="text-sm text-gray-500 hover:underline">
            Gearchiveerd
          </Link>
          <Link
            href="/books/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nieuw boekje
          </Link>
        </div>
      </div>
      {loading ? (
        <BooksListSkeleton />
      ) : books.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen boekjes — voeg er een toe om te beginnen.</p>
      ) : (
        <ul className="space-y-3">
          {books.map(book => (
            <li key={book.id}>
              <HuishoudboekjeCard
                book={book}
                isOwner={book.ownerUid === user?.uid}
                onArchive={handleArchive}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
