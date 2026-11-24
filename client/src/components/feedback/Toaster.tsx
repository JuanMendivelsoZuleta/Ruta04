import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useToast } from './toast-context'
import type { ToastTone } from './toast-context'

const toneStyles: Record<ToastTone, { container: string; icon: string }> = {
  success: { container: 'border-accent/30 bg-panel/95', icon: 'text-accent' },
  error: { container: 'border-red-500/40 bg-panel/95', icon: 'text-red-400' },
  info: { container: 'border-line-strong bg-panel/95', icon: 'text-slate-300' },
}

const toneIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
      aria-live="polite"
    >
      {toasts.map((item) => {
        const Icon = toneIcons[item.tone]
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 text-sm text-slate-100 shadow-xl shadow-black/40 backdrop-blur',
              toneStyles[item.tone].container,
            )}
          >
            <Icon
              className={cn('mt-0.5 size-5 shrink-0', toneStyles[item.tone].icon)}
              aria-hidden="true"
            />
            <p className="flex-1">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Cerrar notificación"
              className="text-slate-500 transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
