import { ArrowLeft, CalendarDays, Images, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useApi } from '@/hooks/useApi'
import { formatCategory, formatDate } from '@/lib/format'
import type { ApiItem, EventItem } from '@/types/api'

export function EventDetailPage() {
  const { id } = useParams()
  const { data, loading, error, reload } = useApi<ApiItem<EventItem>>(
    id ? `/api/events/${id}` : null,
  )
  const event = data?.data

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a eventos
      </Link>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : null}

      {!loading && !error && !event ? (
        <div className="mt-8">
          <EmptyState
            title="Evento no encontrado"
            description="El evento solicitado no existe o no está disponible."
          />
        </div>
      ) : null}

      {event ? (
        <>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-line bg-panel">
              <SmartImage
                src={event.coverImage}
                alt={event.name}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div>
              <Badge tone="accent">{formatCategory(event.sportCategory)}</Badge>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-wide text-white">
                {event.name}
              </h1>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-accent" aria-hidden="true" />
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-accent" aria-hidden="true" />
                  {formatDate(event.date)}
                </p>
              </div>
              {event.description ? (
                <p className="mt-5 text-sm leading-relaxed text-slate-400">
                  {event.description}
                </p>
              ) : null}
              <div className="mt-6 flex items-center gap-2">
                <Badge tone="neutral">DEMO</Badge>
                <span className="text-xs text-slate-500">
                  Evento ficticio de demostración
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              Galería
            </h2>
            <div className="mt-4">
              <EmptyState
                icon={Images}
                title="Galería en la siguiente fase"
                description="La galería completa, el lightbox y la selección de fotos se implementan en P7."
              />
            </div>
          </div>
        </>
      ) : null}
    </Container>
  )
}
