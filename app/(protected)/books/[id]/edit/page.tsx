'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HuishoudboekjeForm from '@/components/HuishoudboekjeForm';
import { getHuishoudboekje, updateHuishoudboekje } from '@/lib/firestore/huishoudboekjes';
import { Huishoudboekje } from '@/types';

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [book, setBook] = useState<Huishoudboekje | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getHuishoudboekje(id).then(data => {
      setBook(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-sm text-gray-400">Laden...</p>;
  if (!book) return <p className="text-sm text-red-500">Boekje niet gevonden.</p>;
  if (book.ownerUid !== user?.uid) return <p className="text-sm text-red-500">Geen toegang — alleen de eigenaar kan dit bewerken.</p>;

  const handleSubmit = async (name: string, description: string) => {
    await updateHuishoudboekje(id, { name, description });
    router.push('/books');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Boekje bewerken</h1>
      <HuishoudboekjeForm
        initialName={book.name}
        initialDescription={book.description}
        onSubmit={handleSubmit}
        submitLabel="Opslaan"
      />
    </div>
  );
}
