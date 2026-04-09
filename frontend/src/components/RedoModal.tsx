import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RedoModalProps {
  open: boolean
  onClose: () => void
  onRedo: (instruction: string) => void
}

export function RedoModal({ open, onClose, onRedo }: RedoModalProps) {
  const [instruction, setInstruction] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setInstruction(''); setError('') }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handleSubmit = () => {
    if (instruction.length < 10) { setError('Min 10 characters'); return }
    onRedo(instruction)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[var(--bg-surface-3)] border border-[var(--border-default)] rounded-xl p-6 w-full max-w-[480px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-2">Request Re-analysis</h3>
            <p className="text-sm font-['DM_Sans'] text-[var(--text-secondary)] mb-4">
              The agent will re-run this analysis using your instructions. The original is archived.
            </p>
            <textarea
              value={instruction} onChange={(e) => setInstruction(e.target.value)}
              placeholder="How should the agent approach this differently?"
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-['DM_Sans'] resize-none
                bg-[var(--form-field-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
                border border-[var(--border-default)] outline-none
                focus:border-[var(--form-focus)] focus:ring-1 focus:ring-[var(--gold-400)]/30"
            />
            <p className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)] mt-1">
              e.g. "Focus on the resource allocation issue — teacher used Cambridge spec for Edexcel"
            </p>
            {error && <p className="text-xs text-[var(--form-error)] mt-1">{error}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-['DM_Sans'] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)]">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-['Syne'] font-medium bg-[var(--gold-400)] text-[#080810] hover:brightness-110">↺ Request Redo</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
