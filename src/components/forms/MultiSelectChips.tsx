import React from 'react'

interface MultiSelectChipsProps {
  label?: string
  required?: boolean
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  error?: string
}

export const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({
  label, required, options, selected, onChange, error,
}) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
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
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-['DM_Sans']
              border transition-all duration-150 cursor-pointer
              ${selected.includes(opt)
                ? 'bg-[var(--gold-dim)] border-[var(--gold-400)] text-[var(--gold-400)]'
                : 'bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
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
}
