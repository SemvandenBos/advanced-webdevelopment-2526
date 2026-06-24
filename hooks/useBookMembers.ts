import { useState, useEffect } from 'react';
import { Huishoudboekje, AppUser } from '@/types/models';
import { getUserByEmail, getUserDocument } from '@/lib/firestore/users';
import { addMember, removeMember } from '@/lib/firestore/huishoudboekjes';

type InviteStatus = 'idle' | 'loading' | 'success' | 'error';

export function useBookMembers(book: Huishoudboekje) {
  const [memberDetails, setMemberDetails] = useState<AppUser[]>([]);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
  const [inviteError, setInviteError] = useState('');
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  useEffect(() => {
    if (book.members.length === 0) {
      setMemberDetails([]);
      return;
    }
    Promise.all(book.members.map(uid => getUserDocument(uid))).then(results => {
      setMemberDetails(results.filter(Boolean) as AppUser[]);
    });
  }, [book.members]);

  const invite = async (email: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return false;

    setInviteStatus('loading');
    setInviteError('');

    try {
      const found = await getUserByEmail(trimmed);

      if (!found) {
        setInviteStatus('error');
        setInviteError('Geen gebruiker gevonden met dit e-mailadres.');
        return false;
      }
      if (found.uid === book.ownerUid) {
        setInviteStatus('error');
        setInviteError('Deze gebruiker is al eigenaar van dit boekje.');
        return false;
      }
      if (book.members.includes(found.uid)) {
        setInviteStatus('error');
        setInviteError('Deze gebruiker is al lid van dit boekje.');
        return false;
      }

      await addMember(book.id, found.uid);
      setInviteStatus('success');
      return true;
    } catch {
      setInviteStatus('error');
      setInviteError('Er is iets misgegaan. Probeer het opnieuw.');
      return false;
    }
  };

  const remove = async (uid: string) => {
    setRemovingUid(uid);
    try {
      await removeMember(book.id, uid);
    } finally {
      setRemovingUid(null);
    }
  };

  const resetInviteStatus = () => setInviteStatus('idle');

  return { memberDetails, inviteStatus, inviteError, removingUid, invite, remove, resetInviteStatus };
}
