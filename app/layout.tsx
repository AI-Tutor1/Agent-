import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tuitional — Wajeeha Agent',
  description: 'Demo Analysis Pipeline Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f0f0f', color: '#e5e5e5', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
