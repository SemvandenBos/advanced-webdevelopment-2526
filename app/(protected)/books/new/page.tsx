'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HuishoudboekjeForm from '@/components/books/HuishoudboekjeForm';
import { createHuishoudboekje } from '@/lib/firestore/huishoudboekjes';

export default function NewBookPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (name: string, description: string) => {
    if (!user) return;
    await createHuishoudboekje(user.uid, { name, description });
    router.push('/books');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nieuw huishoudboekje</h1>
      <HuishoudboekjeForm onSubmit={handleSubmit} submitLabel="Aanmaken" />
    </div>
  );
}
