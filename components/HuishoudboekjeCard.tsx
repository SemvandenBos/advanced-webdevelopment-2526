'use client';

import Link from 'next/link';
import { Huishoudboekje } from '@/types';

interface Props {
  book: Huishoudboekje;
  isOwner: boolean;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function HuishoudboekjeCard({ book, isOwner, onArchive, onRestore, onDelete }: Props) {
  const isArchived = !!onRestore;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {isArchived ? (
          <span className="font-semibold text-gray-700 block truncate">{book.name}</span>
        ) : (
          <Link
            href={`/books/${book.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
          >
            {book.name}
          </Link>
        )}
        {book.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{book.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isArchived ? (
          <>
            {isOwner && onRestore && (
              <button
                onClick={() => onRestore(book.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Terugzetten
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(book.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Verwijderen
              </button>
            )}
          </>
        ) : (
          <>
            {isOwner && (
              <Link
                href={`/books/${book.id}/edit`}
                className="text-sm text-gray-500 hover:underline"
              >
                Bewerken
              </Link>
            )}
            {isOwner && onArchive && (
              <button
                onClick={() => onArchive(book.id)}
                className="text-sm text-gray-500 hover:underline"
              >
                Archiveren
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
