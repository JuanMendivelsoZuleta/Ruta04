import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import {
  controlClasses,
  errorClasses,
  hintClasses,
  labelClasses,
} from './field-styles'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div>
      {label ? (
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          controlClasses,
          'h-auto min-h-28 resize-y py-3',
          error && 'border-red-500/70 focus:border-red-400',
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <p className={errorClasses}>{error}</p>
      ) : hint ? (
        <p className={hintClasses}>{hint}</p>
      ) : null}
    </div>
  )
}
