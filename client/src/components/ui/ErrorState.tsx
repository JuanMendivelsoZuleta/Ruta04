import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export type ErrorStateProps = {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-7 text-red-400" aria-hidden="true" />
      <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-white">
        No se pudo cargar la información
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{message}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
