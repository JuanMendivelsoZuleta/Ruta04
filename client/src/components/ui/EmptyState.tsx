import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/50 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 grid size-12 place-items-center rounded-full bg-panel-soft text-accent">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
