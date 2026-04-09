'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--bg-canvas)]">
      <h1 className="font-['Syne'] font-bold text-4xl text-[var(--text-primary)] mb-2">404</h1>
      <p className="font-['DM_Sans'] text-[var(--text-secondary)] mb-6">Page not found</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-[var(--gold-400)] text-[#080810] font-['Syne'] font-medium text-sm hover:brightness-110"
      >
        Go Home
      </Link>
    </div>
  );
}
