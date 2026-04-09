'use client';

import { ShadowModeBanner } from '@/components/ShadowModeBanner';
import { ToastContainer } from '@/components/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShadowModeBanner />
      <ToastContainer />
      <div style={{ paddingTop: 32 }}>
        {children}
      </div>
    </>
  );
}
