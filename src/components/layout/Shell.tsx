import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, useSidebarWidth } from './Sidebar'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb { label: string; path?: string }

interface ShellProps {
  children: ReactNode
  breadcrumbs?: Breadcrumb[]
}

export function Shell({ children, breadcrumbs = [] }: ShellProps) {
  const navigate = useNavigate()
  const sidebarWidth = useSidebarWidth()

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-canvas)]">
      <Sidebar />
      <div style={{ marginLeft: sidebarWidth }} className="transition-all duration-200">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 px-6 py-3 border-b border-[var(--border-subtle)]">
            {breadcrumbs.map((bc, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-[var(--text-muted)]" />}
                {bc.path ? (
                  <button onClick={() => navigate(bc.path!)} className="text-xs font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    {bc.label}
                  </button>
                ) : (
                  <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)]">{bc.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
