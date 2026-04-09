'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore, MOCK_USERS, type User } from '@/store/auth.store';

const roleLabels: Record<string, string> = {
  counselor: 'Counselor · Product / Counseling',
  sales: 'Sales Agent · Sales',
  dual: 'Head of Counseling · Product / Counseling',
  manager: 'Manager · Operations',
  admin: 'Admin · Technology',
};

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [selected, setSelected] = useState<User | null>(null);

  if (user) {
    router.push('/');
    return null;
  }

  const handleContinue = () => {
    if (!selected) return;
    setUser(selected);
    router.push('/');
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-canvas)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[var(--gold-400)] text-2xl">◆</span>
            <span className="font-['Syne'] font-bold text-2xl text-[var(--text-primary)]">TUITIONAL</span>
          </div>
          <p className="font-['DM_Sans'] text-sm text-[var(--text-secondary)]">AI Company Operating System</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-xl p-8">
          <p className="text-sm font-['DM_Sans'] text-[var(--text-secondary)] mb-5">Select your profile to continue</p>

          <div className="space-y-3">
            {MOCK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-150
                  ${selected?.id === u.id
                    ? 'border-[var(--gold-400)] bg-[var(--gold-dim)]'
                    : 'border-[var(--border-default)] bg-transparent hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]'
                  }`}
              >
                <div className="font-['Syne'] font-medium text-[var(--text-primary)]">{u.name}</div>
                <div className="text-xs font-['DM_Sans'] text-[var(--text-secondary)] mt-0.5">
                  {roleLabels[u.role] || u.role}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full mt-6 min-h-[44px] rounded-lg font-['Syne'] font-medium text-sm
              bg-[var(--gold-400)] text-[#080810] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:brightness-110"
          >
            Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
