'use client';

import Link from 'next/link';
import { useHuishoudboekjes } from '@/hooks/useHuishoudboekjes';
import { useAuth } from '@/contexts/AuthContext';
import HuishoudboekjeCard from '@/components/books/HuishoudboekjeCard';
import { BooksListSkeleton } from '@/components/skeletons/BookCardSkeleton';
import { archiveHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

export default function BooksPage() {
  const { books, loading } = useHuishoudboekjes();
  const { user } = useAuth();

  const handleArchive = async (id: string) => {
    await archiveHuishoudboekje(id);
  };

  const ownedBooks = books.filter(b => b.ownerUid === user?.uid);
  const sharedBooks = books.filter(b => b.ownerUid !== user?.uid);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Huishoudboekjes</h1>
        <div className="flex items-center gap-4">
          <Link href="/books/archived" className={secondaryButtonClass}>
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
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Mijn boekjes</h2>
            {ownedBooks.length === 0 ? (
              <p className="text-gray-500 text-sm">Nog geen boekjes. Voeg er een toe om te beginnen.</p>
            ) : (
              <ul className="space-y-3">
                {ownedBooks.map(book => (
                  <li key={book.id}>
                    <HuishoudboekjeCard
                      book={book}
                      isOwner={true}
                      currentUserUid={user?.uid}
                      onArchive={handleArchive}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {sharedBooks.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Gedeeld met mij</h2>
              <ul className="space-y-3">
                {sharedBooks.map(book => (
                  <li key={book.id}>
                    <HuishoudboekjeCard
                      book={book}
                      isOwner={false}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
