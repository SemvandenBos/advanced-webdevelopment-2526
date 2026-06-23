'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Huishoudboekje } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ShareModal from '@/components/ShareModal';

interface Props {
  book: Huishoudboekje;
  isOwner: boolean;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const secondaryButton =
  'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors';
const dangerButton =
  'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors';
const accentButton =
  'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors';

export default function HuishoudboekjeCard({ book, isOwner, onArchive, onRestore, onDelete }: Props) {
  const isArchived = !!onRestore;
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCardClick = () => {
    if (!isArchived) router.push(`/books/${book.id}`);
  };

  return (
    <>
    <div
      onClick={handleCardClick}
      className={`bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4 transition-colors ${
        isArchived ? '' : 'cursor-pointer hover:border-blue-300'
      }`}
    >
      <div className="min-w-0">
        {isArchived ? (
          <span className="font-semibold text-gray-700 block truncate">{book.name}</span>
        ) : (
          <Link
            href={`/books/${book.id}`}
            onClick={e => e.stopPropagation()}
            className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
          >
            {book.name}
          </Link>
        )}
        {book.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{book.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        {isArchived ? (
          <>
            {isOwner && onRestore && (
              <button
                onClick={() => onRestore(book.id)}
                className={secondaryButton}
              >
                Terugzetten
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(book.id)}
                className={dangerButton}
              >
                Verwijderen
              </button>
            )}
          </>
        ) : (
          <>
            {isOwner && (
              <button
                onClick={() => setShareOpen(true)}
                className={accentButton}
              >
                Delen
              </button>
            )}
            {isOwner && (
              <Link
                href={`/books/${book.id}/edit`}
                className={secondaryButton}
              >
                Bewerken
              </Link>
            )}
            {isOwner && onArchive && (
              <button
                onClick={() => onArchive(book.id)}
                className={secondaryButton}
              >
                Archiveren
              </button>
            )}
          </>
        )}
      </div>
    </div>
    {shareOpen && user && (
      <ShareModal
        book={book}
        currentUserUid={user.uid}
        onClose={() => setShareOpen(false)}
      />
    )}
    </>
  );
}
