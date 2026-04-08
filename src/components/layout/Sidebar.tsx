import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, BarChart2, Users, ClipboardList, Settings, Search, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const navItems = [
  { icon: LayoutDashboard, label: 'Company', path: '/manager' },
  { icon: AlertTriangle, label: 'Escalations', path: '/manager/escalations', badge: 3 },
  { icon: BarChart2, label: 'Analytics', path: '/manager/analytics' },
  { icon: Users, label: 'All Agents', path: '/manager/agent-log' },
  { icon: ClipboardList, label: 'Task Board', path: '/manager/review', badge: 28 },
  { icon: Settings, label: 'Settings', path: '/manager/settings' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setViewMode } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setCollapsed(w >= 768 && w < 1280)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/manager') return location.pathname === '/manager'
    return location.pathname.startsWith(path)
  }

  const sidebarWidth = collapsed ? 56 : 240

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-[var(--gold-400)] text-lg">◆</span>
          {!collapsed && (
            <div>
              <div className="font-['Syne'] font-bold text-sm text-[var(--gold-400)]">TUITIONAL</div>
              <div className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)]">AI Operating System</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[var(--status-active)] pulse-dot" />
            <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)]">Active · Shadow Mode</span>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-['DM_Sans'] text-[var(--text-muted)] hover:border-[var(--border-default)]"
          >
            <Search size={14} />
            <span>Search agents, tasks…</span>
            <span className="ml-auto text-[10px] font-['JetBrains_Mono'] opacity-50">⌘K</span>
          </button>
        </div>
      )}

      {/* Dual Role Toggle */}
      {user?.role === 'dual' && !collapsed && (
        <div className="px-4 mb-3">
          <div className="flex bg-[var(--bg-surface-2)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
            <button
              onClick={() => { setViewMode('counselor'); navigate('/counselor') }}
              className="flex-1 text-xs py-1.5 rounded-md font-['DM_Sans'] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >Counselor</button>
            <button className="flex-1 text-xs py-1.5 rounded-md font-['DM_Sans'] bg-[var(--gold-dim)] text-[var(--gold-400)]">
              Manager
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-['DM_Sans'] transition-all duration-150 relative
                ${active ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]/50 hover:text-[var(--text-primary)]'}`}
            >
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--gold-400)] rounded-r" />}
              <item.icon size={18} className={active ? 'text-[var(--gold-400)]' : ''} />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-['JetBrains_Mono'] rounded-full px-1.5 bg-[var(--gold-dim)] text-[var(--gold-400)]">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Health Panel */}
      {!collapsed && (
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-2">
          <div className="text-[10px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)]">System Status</div>
          <div className="flex items-center gap-1.5 text-xs font-['DM_Sans'] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-active)]" />13 agents online
          </div>
          <div className="space-y-1 text-[11px] font-['DM_Sans']">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">SHADOW MODE</span>
              <span className="px-1.5 py-0.5 rounded text-[var(--status-shadow)] bg-[var(--status-shadow)]/15 border border-[var(--status-shadow)]/30">ON</span>
            </div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Database</span><span className="text-[var(--status-active)]">OK</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Sheets API</span><span className="text-[var(--status-active)]">OK</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Claude API</span><span className="text-[var(--status-active)]">OK</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">LMS</span><span className="text-[var(--status-pending)]">MOCK</span></div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-9 left-3 z-40 p-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-default)] md:hidden"
      >
        <Menu size={18} className="text-[var(--text-primary)]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-[240px] h-full bg-[var(--bg-surface-1)] border-r border-[var(--border-subtle)]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-[var(--text-muted)]"><X size={18} /></button>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className="hidden md:block fixed top-8 left-0 bottom-0 bg-[var(--bg-surface-1)] border-r border-[var(--border-subtle)] z-30 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        {content}
      </div>
    </>
  )
}

export function useSidebarWidth() {
  const [width, setWidth] = useState(240)
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      if (w < 768) setWidth(0)
      else if (w < 1280) setWidth(56)
      else setWidth(240)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return width
}
