import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SpinnerProps = {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-400">
      <Loader2 className={cn('size-4 animate-spin text-accent', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
