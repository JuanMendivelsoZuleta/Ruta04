import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/cn'
import { formatCategory, formatDate } from '@/lib/format'
import type { EventItem } from '@/types/api'

export type EventCardProps = {
  event: EventItem
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-accent/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-soft">
        <SmartImage
          src={event.coverImage}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night/90 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute left-4 top-4">
          <Badge tone="accent">{formatCategory(event.sportCategory)}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
          {event.name}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-accent" aria-hidden="true" />
            {event.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-accent" aria-hidden="true" />
            {formatDate(event.date)}
          </span>
        </div>
      </div>
    </Link>
  )
}
