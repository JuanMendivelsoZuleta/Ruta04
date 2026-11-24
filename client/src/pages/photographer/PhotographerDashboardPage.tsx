import {
  CalendarDays,
  CheckCircle2,
  EyeOff,
  Images,
  Plus,
  Upload,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LinkButton } from '@/components/ui/LinkButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { formatCategory, formatDate, formatPrice } from '@/lib/format'
import type { ApiList, EventItem, Photo } from '@/types/api'

export function PhotographerDashboardPage() {
  const eventsState = useApi<ApiList<EventItem>>('/api/events')
  const photosState = useApi<ApiList<Photo>>('/api/photos')

  const loading = eventsState.loading || photosState.loading
  const error = eventsState.error ?? photosState.error
  const events = eventsState.data?.data ?? []
  const photos = photosState.data?.data ?? []
  const available = photos.filter((photo) => photo.available)
  const publishedValue = available.reduce((sum, photo) => sum + photo.price, 0)

  const reloadAll = () => {
    eventsState.reload()
    photosState.reload()
  }

  const stats = [
    { label: 'Eventos', value: String(events.length), icon: CalendarDays },
    { label: 'Fotografías', value: String(photos.length), icon: Images },
    { label: 'Disponibles', value: String(available.length), icon: CheckCircle2 },
    {
      label: 'No disponibles',
      value: String(photos.length - available.length),
      icon: EyeOff,
    },
    { label: 'Valor publicado', value: formatPrice(publishedValue), icon: Wallet },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Resumen
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Datos reales del catálogo DEMO (sin métricas inventadas).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/photographer/events/new" leftIcon={<Plus className="size-4" />}>
            Crear evento
          </LinkButton>
          <LinkButton
            to="/photographer/photos/upload"
            variant="secondary"
            leftIcon={<Upload className="size-4" />}
          >
            Subir fotografías
          </LinkButton>
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reloadAll} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {loading
              ? [0, 1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-24" />
                ))
              : stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="rounded-2xl border border-line bg-panel p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                          {stat.label}
                        </span>
                        <Icon className="size-4 text-accent" aria-hidden="true" />
                      </div>
                      <p className="mt-3 font-display text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                Eventos recientes
              </h3>
              <Link
                to="/photographer/events"
                className="text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <Skeleton key={item} className="h-12" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <EmptyState
                  title="Aún no hay eventos"
                  description="Crea tu primer evento DEMO para empezar a subir fotografías."
                  action={<LinkButton to="/photographer/events/new">Crear evento</LinkButton>}
                />
              ) : (
                <ul className="divide-y divide-line">
                  {events.slice(0, 5).map((event) => (
                    <li
                      key={event.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{event.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCategory(event.sportCategory)} · {event.location} ·{' '}
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <Link
                        to={`/photographer/photos?eventId=${event.id}`}
                        className="text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                      >
                        Fotos
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
