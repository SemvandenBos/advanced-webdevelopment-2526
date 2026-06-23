'use client';

import { useState, useEffect } from 'react';
import { Huishoudboekje, AppUser } from '@/types';
import { getUserByEmail, getUserDocument } from '@/lib/firestore/users';
import { addMember, removeMember } from '@/lib/firestore/huishoudboekjes';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

interface Props {
  book: Huishoudboekje;
  currentUserUid: string;
  onClose: () => void;
}

export default function ShareModal({ book, currentUserUid, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<AppUser[]>([]);

  useEffect(() => {
    if (book.members.length === 0) {
      setMemberDetails([]);
      return;
    }
    Promise.all(book.members.map(uid => getUserDocument(uid))).then(results => {
      setMemberDetails(results.filter(Boolean) as AppUser[]);
    });
  }, [book.members]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const found = await getUserByEmail(trimmed);

      if (!found) {
        setStatus('error');
        setErrorMessage('Geen gebruiker gevonden met dit e-mailadres.');
        return;
      }
      if (found.uid === book.ownerUid) {
        setStatus('error');
        setErrorMessage('Deze gebruiker is al eigenaar van dit boekje.');
        return;
      }
      if (book.members.includes(found.uid)) {
        setStatus('error');
        setErrorMessage('Deze gebruiker is al lid van dit boekje.');
        return;
      }

      await addMember(book.id, found.uid);
      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Er is iets misgegaan. Probeer het opnieuw.');
    }
  };

  const handleRemove = async (uid: string) => {
    setRemovingUid(uid);
    try {
      await removeMember(book.id, uid);
    } finally {
      setRemovingUid(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Delen: {book.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="E-mailadres uitnodigen"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {status === 'loading' ? 'Bezig...' : 'Uitnodigen'}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
        )}
        {status === 'success' && (
          <p className="text-sm text-green-600 mb-3">Gebruiker succesvol toegevoegd.</p>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Huidige leden
          </p>
          {book.members.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nog geen leden uitgenodigd.</p>
          ) : (
            <ul className="space-y-2">
              {memberDetails.map(member => (
                <li
                  key={member.uid}
                  className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{member.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  {member.uid !== currentUserUid && (
                    <button
                      onClick={() => handleRemove(member.uid)}
                      disabled={removingUid === member.uid}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 text-xs shrink-0 ml-3"
                    >
                      {removingUid === member.uid ? 'Bezig...' : 'Verwijderen'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className={secondaryButtonClass}>
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
