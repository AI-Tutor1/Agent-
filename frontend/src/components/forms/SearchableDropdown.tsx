import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface Option {
  label: string
  sublabel?: string
}

interface SearchableDropdownProps {
  label?: string
  required?: boolean
  options: Option[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label, required, options, value, onChange, placeholder, error,
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const select = (val: string) => {
    onChange(val)
    setQuery('')
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  const clear = () => {
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0 && filtered[highlightIndex]) {
      e.preventDefault()
      select(filtered[highlightIndex].label)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
          {label}{required && <span className="text-[var(--form-error)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={value || placeholder}
          value={value ? value : query}
          onChange={(e) => {
            if (value) { onChange(''); }
            setQuery(e.target.value)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full min-h-[44px] px-3 py-2.5 pr-8 rounded-lg text-sm font-['DM_Sans']
            bg-[var(--form-field-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
            border transition-colors duration-150 outline-none
            ${error ? 'border-[var(--form-error)]' : 'border-[var(--border-default)]'}
            focus:border-[var(--form-focus)] focus:ring-1 focus:ring-[var(--gold-400)]/30`}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        )}
        {isOpen && filtered.length > 0 && (
          <div className="absolute z-30 w-full mt-1 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-lg shadow-lg max-h-60 overflow-auto">
            {filtered.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => select(opt.label)}
                className={`w-full text-left px-3 py-2.5 transition-colors
                  ${i === highlightIndex ? 'bg-[var(--bg-hover)]' : ''}
                  ${opt.label === value ? 'bg-[var(--gold-dim)]' : ''}
                  hover:bg-[var(--bg-hover)]`}
              >
                <div className="text-sm font-['DM_Sans'] text-[var(--text-primary)]">{opt.label}</div>
                {opt.sublabel && (
                  <div className="text-xs font-['DM_Sans'] text-[var(--text-muted)]">{opt.sublabel}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[12px] font-['DM_Sans'] text-[var(--form-error)]">{error}</p>
      )}
    </div>
  )
}
