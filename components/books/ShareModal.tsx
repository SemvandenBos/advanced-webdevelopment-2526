'use client';

import { useState } from 'react';
import { Huishoudboekje } from '@/types/models';
import { useBookMembers } from '@/hooks/useBookMembers';
import { secondaryButtonClass } from '@/components/ui/buttonStyles';

interface Props {
  book: Huishoudboekje;
  currentUserUid: string;
  onClose: () => void;
}

export default function ShareModal({ book, currentUserUid, onClose }: Props) {
  const [email, setEmail] = useState('');
  const { memberDetails, inviteStatus, inviteError, removingUid, invite, remove, resetInviteStatus } = useBookMembers(book);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await invite(email);
    if (success) setEmail('');
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
              if (inviteStatus !== 'idle') resetInviteStatus();
            }}
            placeholder="E-mailadres uitnodigen"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={inviteStatus === 'loading'}
          />
          <button
            type="submit"
            disabled={inviteStatus === 'loading' || !email.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {inviteStatus === 'loading' ? 'Bezig...' : 'Uitnodigen'}
          </button>
        </form>

        {inviteStatus === 'error' && (
          <p className="text-sm text-red-600 mb-3">{inviteError}</p>
        )}
        {inviteStatus === 'success' && (
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
                      onClick={() => remove(member.uid)}
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
