import React from 'react'

interface SegmentedSelectorProps {
  label?: string
  required?: boolean
  options: string[]
  value: string
  onChange: (v: string) => void
  error?: string
}

export const SegmentedSelector: React.FC<SegmentedSelectorProps> = ({
  label, required, options, value, onChange, error,
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
        {label}{required && <span className="text-[var(--form-error)] ml-0.5">*</span>}
      </label>
    )}
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-2 rounded-lg text-sm font-['Syne'] font-medium
            border transition-all duration-150 cursor-pointer
            ${value === opt
              ? 'bg-[var(--gold-dim)] border-[var(--gold-400)] text-[var(--gold-400)]'
              : 'bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
    {error && (
      <p className="text-[12px] font-['DM_Sans'] text-[var(--form-error)]">{error}</p>
    )}
  </div>
)
