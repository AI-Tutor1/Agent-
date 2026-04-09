import React, { forwardRef } from 'react'

interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  helperText?: string
  maxLength?: number
  currentLength?: number
  children?: React.ReactNode
}

interface InputFieldProps extends FormFieldProps {
  type?: 'text' | 'date' | 'tel'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  disabled?: boolean
}

interface TextareaFieldProps extends FormFieldProps {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
  rows?: number
  disabled?: boolean
}

export const FormFieldWrapper: React.FC<FormFieldProps & { children: React.ReactNode }> = ({
  label, required, error, helperText, maxLength, currentLength, children,
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
        {label}{required && <span className="text-[var(--form-error)] ml-0.5">*</span>}
      </label>
    )}
    {children}
    <div className="flex items-center justify-between">
      {error ? (
        <p className="text-[12px] font-['DM_Sans'] text-[var(--form-error)]">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-['DM_Sans'] text-[var(--text-muted)]">{helperText}</p>
      ) : <span />}
      {maxLength !== undefined && currentLength !== undefined && (
        <span className="text-[11px] font-['JetBrains_Mono'] text-[var(--text-muted)]">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  </div>
)

export const FormInput = forwardRef<HTMLInputElement, InputFieldProps>(({
  label, required, error, helperText, type = 'text', placeholder, value, onChange, onBlur, disabled,
}, ref) => (
  <FormFieldWrapper label={label} required={required} error={error} helperText={helperText}>
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-['DM_Sans']
        bg-[var(--form-field-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
        border transition-colors duration-150 outline-none
        ${error ? 'border-[var(--form-error)]' : 'border-[var(--border-default)]'}
        focus:border-[var(--form-focus)] focus:ring-1 focus:ring-[var(--gold-400)]/30
        disabled:opacity-50`}
    />
  </FormFieldWrapper>
))
FormInput.displayName = 'FormInput'

export const FormTextarea: React.FC<TextareaFieldProps> = ({
  label, required, error, helperText, placeholder, value, onChange, onBlur, rows = 3, maxLength, disabled,
}) => (
  <FormFieldWrapper
    label={label} required={required} error={error} helperText={helperText}
    maxLength={maxLength} currentLength={value.length}
  >
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-3 py-2.5 rounded-lg text-sm font-['DM_Sans'] resize-none
        bg-[var(--form-field-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
        border transition-colors duration-150 outline-none
        ${error ? 'border-[var(--form-error)]' : 'border-[var(--border-default)]'}
        focus:border-[var(--form-focus)] focus:ring-1 focus:ring-[var(--gold-400)]/30
        disabled:opacity-50`}
    />
  </FormFieldWrapper>
)

export const FormSelect: React.FC<{
  label?: string
  required?: boolean
  error?: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}> = ({ label, required, error, value, onChange, options, placeholder }) => (
  <FormFieldWrapper label={label} required={required} error={error}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-['DM_Sans']
        bg-[var(--form-field-bg)] text-[var(--text-primary)]
        border transition-colors duration-150 outline-none appearance-none
        ${error ? 'border-[var(--form-error)]' : 'border-[var(--border-default)]'}
        focus:border-[var(--form-focus)] focus:ring-1 focus:ring-[var(--gold-400)]/30`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </FormFieldWrapper>
)
