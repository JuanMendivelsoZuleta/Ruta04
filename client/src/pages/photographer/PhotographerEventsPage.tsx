import { CalendarDays, Images, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LinkButton } from '@/components/ui/LinkButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { ApiError, eventsApi } from '@/lib/api'
import { formatCategory, formatDate } from '@/lib/format'
import type { ApiList, EventItem } from '@/types/api'

export function PhotographerEventsPage() {
  const { data, loading, error, reload } = useApi<ApiList<EventItem>>('/api/events')
  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const events = data?.data ?? []

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await eventsApi.remove(deleteTarget.id)
      toast('Evento eliminado', 'success')
      setDeleteTarget(null)
      reload()
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudo eliminar el evento.'
      toast(message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Eventos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Crea, edita y elimina eventos de la demo.
          </p>
        </div>
        <LinkButton to="/photographer/events/new" leftIcon={<Plus className="size-4" />}>
          Crear evento
        </LinkButton>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-28" />
            ))}
          </div>
        ) : null}

        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}

        {!loading && !error && events.length === 0 ? (
          <EmptyState
            title="Aún no hay eventos"
            description="Crea el primer evento DEMO para asociar fotografías."
            action={<LinkButton to="/photographer/events/new">Crear evento</LinkButton>}
          />
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <ul className="grid gap-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                      {event.name}
                    </h3>
                    <Badge tone="accent">{formatCategory(event.sportCategory)}</Badge>
                    <Badge tone={event.status === 'ACTIVE' ? 'neutral' : 'muted'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-accent" aria-hidden="true" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-accent" aria-hidden="true" />
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <LinkButton
                    to={`/photographer/events/${event.id}/edit`}
                    variant="secondary"
                    size="sm"
                    leftIcon={<Pencil className="size-4" />}
                  >
                    Editar
                  </LinkButton>
                  <LinkButton
                    to={`/photographer/photos?eventId=${event.id}`}
                    variant="ghost"
                    size="sm"
                    leftIcon={<Images className="size-4" />}
                  >
                    Fotografías
                  </LinkButton>
                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                  >
                    Ver público
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="size-4" />}
                    onClick={() => setDeleteTarget(event)}
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar evento"
        description={`Se eliminará "${deleteTarget?.name ?? ''}" y sus fotografías asociadas. Si alguna fotografía ya fue comprada en un pedido, el servidor impedirá el borrado.`}
        confirmLabel="Eliminar evento"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />
    </div>
  )
}
