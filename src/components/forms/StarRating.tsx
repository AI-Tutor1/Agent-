import React, { useState } from 'react'

interface StarRatingProps {
  label?: string
  required?: boolean
  value: number
  onChange: (v: number) => void
  max?: number
  error?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  label, required, value, onChange, max = 10, error,
}) => {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value
  const row1 = Array.from({ length: Math.min(max, 5) }, (_, i) => i + 1)
  const row2 = max > 5 ? Array.from({ length: max - 5 }, (_, i) => i + 6) : []

  const Star = ({ n }: { n: number }) => (
    <button
      type="button"
      onClick={() => onChange(n)}
      onMouseEnter={() => setHoverValue(n)}
      onMouseLeave={() => setHoverValue(0)}
      className="w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-transform hover:scale-110"
    >
      <span className={n <= displayValue ? 'text-[var(--gold-400)]' : 'text-[var(--text-muted)] opacity-30'}>
        ★
      </span>
    </button>
  )

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
          {label}{required && <span className="text-[var(--form-error)] ml-0.5">*</span>}
        </label>
      )}
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="flex">{row1.map((n) => <Star key={n} n={n} />)}</div>
          {row2.length > 0 && (
            <div className="flex">{row2.map((n) => <Star key={n} n={n} />)}</div>
          )}
        </div>
        <span className="font-['JetBrains_Mono'] text-base text-[var(--text-primary)]">
          {value}/{max}
        </span>
      </div>
      {error && (
        <p className="text-[12px] font-['DM_Sans'] text-[var(--form-error)]">{error}</p>
      )}
    </div>
  )
}
