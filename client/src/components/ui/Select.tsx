import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import {
  controlClasses,
  errorClasses,
  hintClasses,
  labelClasses,
} from './field-styles'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function Select({
  label,
  hint,
  error,
  children,
  id,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div>
      {label ? (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            controlClasses,
            'appearance-none pr-10',
            error && 'border-red-500/70 focus:border-red-400',
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
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
