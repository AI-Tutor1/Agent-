import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronDown, ChevronUp, Zap, CameraOff, Users, WifiOff, XCircle, BookOpen, Clock, UserX, Maximize2, Check, Edit3, RotateCcw, X } from 'lucide-react'
import type { DemoAnalysis } from '@/types/mock'
import { RejectModal } from './RejectModal'
import { RedoModal } from './RedoModal'
import { useToast } from './Toast'

const pourIcons: Record<string, React.ElementType> = {
  Video: CameraOff, Interaction: Users, Technical: WifiOff,
  Cancellation: XCircle, Resources: BookOpen, Time: Clock, 'No Show': UserX,
}
const severityColors: Record<string, string> = { High: 'var(--pour-high)', Medium: 'var(--pour-medium)', Low: 'var(--pour-low)' }
const accColors: Record<string, string> = { Sales: 'var(--acc-sales)', Product: 'var(--acc-product)', Consumer: 'var(--acc-consumer)', Mixed: 'var(--acc-mixed)' }

interface Props {
  analysis: DemoAnalysis
  index?: number
  onApprove?: (id: string) => void
  onReject?: (id: string, reason: string) => void
  onRedo?: (id: string, instruction: string) => void
  onExpand?: (id: string) => void
  expanded?: boolean
}

export function DemoAnalysisCard({ analysis: a, index = 0, onApprove, onReject, onRedo, onExpand, expanded = false }: Props) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [redoOpen, setRedoOpen] = useState(false)
  const toast = useToast()

  const confColor = a.confidence >= 8 ? 'var(--gold-400)' : a.confidence >= 6 ? 'var(--status-pending)' : 'var(--status-error)'
  const borderColor = a.status === 'escalated' ? 'var(--status-escalated)' : confColor

  const stars = (n: number, max = 5) => Array.from({ length: max }, (_, i) => i < n)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:border-[var(--border-strong)] transition-all duration-150"
        style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-['DM_Sans'] px-2 py-0.5 rounded-full border"
                style={{
                  color: a.status === 'approved' ? 'var(--status-approved)' : a.status === 'escalated' ? 'var(--status-escalated)' : 'var(--status-shadow)',
                  borderColor: a.status === 'approved' ? 'var(--status-approved)' : a.status === 'escalated' ? 'var(--status-escalated)' : 'var(--status-shadow)',
                  backgroundColor: `color-mix(in srgb, ${a.status === 'approved' ? 'var(--status-approved)' : a.status === 'escalated' ? 'var(--status-escalated)' : 'var(--status-shadow)'} 10%, transparent)`,
                }}>
                {a.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-['Syne'] font-semibold px-2.5 py-1 rounded-md border"
                style={{
                  color: confColor,
                  borderColor: confColor,
                  backgroundColor: `color-mix(in srgb, ${confColor} 12%, transparent)`,
                }}>
                Conf: {a.confidence.toFixed(1)}/10
              </span>
              <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)]">{a.processingTime}</span>
            </div>
          </div>

          <div className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] flex items-center gap-1.5">
            {a.teacher} <ChevronRight size={16} className="text-[var(--text-muted)]" /> {a.student}
          </div>
          <div className="text-[13px] font-['DM_Sans'] text-[var(--text-secondary)] mt-1">
            {a.level} · {a.subject} · {a.date} · {a.salesAgent}
          </div>

          {/* Ratings */}
          <div className="flex gap-6 mt-3">
            <div>
              <span className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">Student</span>
              <div className="flex items-center gap-1">
                {stars(a.studentRating).map((filled, i) => (
                  <span key={i} className={filled ? 'text-[var(--gold-400)]' : 'text-[var(--text-muted)] opacity-30'}>★</span>
                ))}
                <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)] ml-1">{a.studentRating}/5</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">Analyst</span>
              <div className="flex items-center gap-1">
                {stars(a.analystRating).map((filled, i) => (
                  <span key={i} className={filled ? 'text-[var(--gold-400)]' : 'text-[var(--text-muted)] opacity-30'}>★</span>
                ))}
                <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-secondary)] ml-1">{a.analystRating}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative */}
        <div className="border-t border-[var(--border-subtle)] p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Teaching Methodology', text: a.methodology },
              { label: 'Topic Selection', text: a.topicSelection },
              { label: 'Resources', text: a.resourceUsage },
              { label: 'Interaction', text: a.interactivity },
            ].map((q) => (
              <div key={q.label}>
                <div className="text-[11px] font-['Syne'] font-semibold uppercase text-[var(--text-muted)] mb-1">{q.label}</div>
                <p className={`text-[13px] font-['DM_Sans'] text-[var(--text-secondary)] ${expanded ? '' : 'line-clamp-4'}`}>{q.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="border-t border-[var(--border-subtle)] px-5 py-3 flex items-start gap-2">
          <Zap size={14} className="text-[var(--gold-400)] mt-0.5 flex-shrink-0" />
          <p className="text-sm font-['DM_Sans'] text-[var(--text-primary)]">{a.improvements}</p>
        </div>

        {/* POUR Flags */}
        {a.pourFlags.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] px-5 py-3 flex flex-wrap gap-2">
            {a.pourFlags.map((f, i) => {
              const Icon = pourIcons[f.category] || Clock
              const col = severityColors[f.severity]
              return (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border"
                  style={{ color: col, borderColor: `color-mix(in srgb, ${col} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${col} 10%, transparent)` }}>
                  <Icon size={12} /> {f.category}: {f.severity}
                </span>
              )
            })}
          </div>
        )}

        {/* Accountability */}
        {a.accountability && a.conversionStatus === 'Not Converted' && (
          <div className="border-t border-[var(--border-subtle)] px-5 py-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-['DM_Sans'] text-[var(--not-converted)] font-medium">NOT CONVERTED</span>
              <span className="text-xs text-[var(--text-muted)]">· Agent: {a.salesAgent}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border font-['DM_Sans']"
                style={{
                  color: accColors[a.accountability.classification] || 'var(--text-secondary)',
                  borderColor: `color-mix(in srgb, ${accColors[a.accountability.classification] || '#888'} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accColors[a.accountability.classification] || '#888'} 10%, transparent)`,
                }}>
                {a.accountability.classification}
              </span>
              <span className="text-xs text-[var(--text-muted)]">Confidence: {a.accountability.confidence}</span>
            </div>
            <blockquote className="text-sm font-['DM_Sans'] text-[var(--text-secondary)] italic pl-3 border-l-2 border-[var(--border-default)]">
              "{a.accountability.evidence}"
            </blockquote>
          </div>
        )}

        {/* Student Feedback (collapsible) */}
        <div className="border-t border-[var(--border-subtle)]">
          <button onClick={() => setShowFeedback(!showFeedback)} className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-['DM_Sans'] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
            Student Feedback {showFeedback ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showFeedback && (
            <div className="px-5 pb-3 text-sm font-['DM_Sans'] text-[var(--text-secondary)] italic">
              Rating: {a.studentRating}/5 · "{a.feedbackText}"
            </div>
          )}
        </div>

        {/* Data Sources (collapsible) */}
        <div className="border-t border-[var(--border-subtle)]">
          <button onClick={() => setShowSources(!showSources)} className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-['DM_Sans'] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
            Data Sources {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showSources && (
            <div className="px-5 pb-3 space-y-1 text-xs font-['DM_Sans'] text-[var(--text-secondary)]">
              <div>✓ Counselor: Wajeeha · 3h ago · 8/10 fields</div>
              <div>✓ Sales: {a.salesAgent} · 45min ago · 5 fields</div>
              <div>✓ Feedback: Matched from form</div>
              <div>✓ Agent: Claude Sonnet · {a.processingTime} · <span className="font-['JetBrains_Mono']">{a.tokensUsed.toLocaleString()}</span> tokens</div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="border-t border-[var(--border-subtle)] px-5 py-3 flex items-center gap-2 flex-wrap">
          {showApproveConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-['DM_Sans'] text-[var(--text-secondary)]">Confirm?</span>
              <button onClick={() => { onApprove?.(a.id); setShowApproveConfirm(false); toast('Analysis approved — ' + a.teacher + ' → ' + a.student, 'success') }}
                className="px-3 py-1.5 rounded text-xs font-['DM_Sans'] bg-[var(--status-active)] text-white">Yes</button>
              <button onClick={() => setShowApproveConfirm(false)}
                className="px-3 py-1.5 rounded text-xs font-['DM_Sans'] text-[var(--text-secondary)] border border-[var(--border-default)]">No</button>
            </div>
          ) : (
            <button onClick={() => setShowApproveConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-['Syne'] font-medium bg-[var(--gold-400)] text-[#080810] hover:brightness-110 flex items-center gap-1.5">
              <Check size={14} /> Approve
            </button>
          )}
          <button onClick={() => console.log('edit')}
            className="px-4 py-2 rounded-lg text-sm font-['DM_Sans'] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={() => setRejectOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-['DM_Sans'] text-[var(--status-error)] border border-[var(--status-error)]/30 hover:bg-[var(--status-error)]/10 flex items-center gap-1.5">
            <X size={14} /> Reject
          </button>
          <button onClick={() => setRedoOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-['DM_Sans'] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5">
            <RotateCcw size={14} /> Redo
          </button>
          {onExpand && (
            <button onClick={() => onExpand(a.id)}
              className="ml-auto p-2 rounded-lg text-[var(--text-muted)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)]">
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </motion.div>

      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onReject={(r) => { onReject?.(a.id, r); toast('Analysis rejected', 'error') }} />
      <RedoModal open={redoOpen} onClose={() => setRedoOpen(false)} onRedo={(ins) => { onRedo?.(a.id, ins); toast('Re-analysis requested', 'warning') }} />
    </>
  )
}
