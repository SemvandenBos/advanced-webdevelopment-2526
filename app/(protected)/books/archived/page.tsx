'use client';

import Link from 'next/link';
import { useArchivedHuishoudboekjes } from '@/hooks/useHuishoudboekjes';
import { useAuth } from '@/contexts/AuthContext';
import HuishoudboekjeCard from '@/components/books/HuishoudboekjeCard';
import { BooksListSkeleton } from '@/components/skeletons/BookCardSkeleton';
import { restoreHuishoudboekje, deleteHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

export default function ArchivedBooksPage() {
  const { books, loading } = useArchivedHuishoudboekjes();
  const { user } = useAuth();

  const handleRestore = async (id: string) => {
    await restoreHuishoudboekje(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit boekje definitief wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return;
    await deleteHuishoudboekje(id);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/books" className={secondaryButtonClass}>
          ← Terug naar overzicht
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Gearchiveerde boekjes</h1>
      </div>
      {loading ? (
        <BooksListSkeleton />
      ) : books.length === 0 ? (
        <p className="text-gray-500 text-sm">Geen gearchiveerde boekjes.</p>
      ) : (
        <ul className="space-y-3">
          {books.map(book => (
            <li key={book.id}>
              <HuishoudboekjeCard
                book={book}
                isOwner={book.ownerUid === user?.uid}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
