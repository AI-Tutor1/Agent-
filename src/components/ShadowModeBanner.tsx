export function ShadowModeBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 h-8 text-xs font-['DM_Sans']"
      style={{
        backgroundColor: 'rgba(96, 165, 250, 0.12)',
        borderBottom: '1px solid rgba(96, 165, 250, 0.30)',
        color: '#60A5FA',
      }}
    >
      <span className="inline-block w-2 h-2 rounded-full bg-current pulse-dot" />
      <span>SHADOW MODE ACTIVE — Agents are observing, not acting. All outputs are for review only.</span>
    </div>
  )
}
