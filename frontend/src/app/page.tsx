'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'counselor') {
      router.replace('/counselor');
    } else if (user.role === 'sales') {
      router.replace('/sales');
    } else {
      router.replace('/manager');
    }
  }, [user, router]);

  return null;
}
