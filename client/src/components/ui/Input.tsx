import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import {
  controlClasses,
  errorClasses,
  hintClasses,
  labelClasses,
} from './field-styles'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            controlClasses,
            Boolean(leftIcon) && 'pl-10',
            error && 'border-red-500/70 focus:border-red-400',
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p className={errorClasses}>{error}</p>
      ) : hint ? (
        <p className={hintClasses}>{hint}</p>
      ) : null}
    </div>
  )
}
