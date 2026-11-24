import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'accent' | 'muted' | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-line-strong bg-panel-soft text-slate-300',
  accent: 'border-accent/30 bg-accent/15 text-accent',
  muted: 'border-transparent bg-night/70 text-slate-400',
  danger: 'border-red-500/30 bg-red-500/10 text-red-300',
}

export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
