'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    // Redirect walk-in registrations directly to the consolidated /profile portal
    router.replace('/profile');
  }, [router]);

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <Navbar />
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-sm text-zinc-400 font-medium">Redirecting to Pablings Client Portal...</p>
      </div>
    </main>
  );
}
