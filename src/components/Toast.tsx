import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now().toString()
    set((s) => ({ toasts: [{ id, message, type }, ...s.toasts].slice(0, 3) }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast)
  return addToast
}

const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const colors = {
  success: 'var(--status-active)', error: 'var(--status-error)',
  warning: 'var(--status-pending)', info: 'var(--status-shadow)',
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.removeToast)
  const Icon = icons[toast.type]

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start gap-3 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-lg px-4 py-3 shadow-lg min-w-[280px] max-w-[380px]"
      style={{ borderLeftWidth: 3, borderLeftColor: colors[toast.type] }}
    >
      <Icon size={16} style={{ color: colors[toast.type], flexShrink: 0, marginTop: 2 }} />
      <p className="text-sm font-['DM_Sans'] text-[var(--text-primary)] flex-1">{toast.message}</p>
      <button onClick={() => remove(toast.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="fixed top-12 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}
