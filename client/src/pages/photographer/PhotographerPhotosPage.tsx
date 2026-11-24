import { Images, Pencil, Trash2, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { PhotoEditDialog } from '@/components/photographer/PhotoEditDialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LinkButton } from '@/components/ui/LinkButton'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useApi } from '@/hooks/useApi'
import { ApiError, photosApi } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import type { ApiList, EventItem, Photo } from '@/types/api'

export function PhotographerPhotosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const eventId = searchParams.get('eventId') ?? ''
  const availableFilter = searchParams.get('available') ?? 'all'
  const { toast } = useToast()

  const eventsState = useApi<ApiList<EventItem>>('/api/events')

  const path = useMemo(() => {
    const params = new URLSearchParams()
    if (eventId) params.set('eventId', eventId)
    if (availableFilter !== 'all') params.set('available', availableFilter)
    const query = params.toString()
    return `/api/photos${query ? `?${query}` : ''}`
  }, [eventId, availableFilter])

  const photosState = useApi<ApiList<Photo>>(path)

  const events = eventsState.data?.data ?? []
  const photos = photosState.data?.data ?? []
  const [editTarget, setEditTarget] = useState<Photo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const uploadLink = eventId
    ? `/photographer/photos/upload?eventId=${encodeURIComponent(eventId)}`
    : '/photographer/photos/upload'

  const hasFilters = Boolean(eventId || availableFilter !== 'all')

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await photosApi.remove(deleteTarget.id)
      toast('Fotografía eliminada', 'success')
      setDeleteTarget(null)
      photosState.reload()
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudo eliminar la fotografía.'
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
            Fotografías
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Filtra, edita precio/disponibilidad y elimina fotografías.
          </p>
        </div>
        <LinkButton to={uploadLink} leftIcon={<Upload className="size-4" />}>
          Subir fotografías
        </LinkButton>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
        <Select
          label="Evento"
          value={eventId}
          onChange={(event) => updateFilter('eventId', event.target.value)}
        >
          <option value="">Todos los eventos</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
        <Select
          label="Disponibilidad"
          value={availableFilter}
          onChange={(event) =>
            updateFilter('available', event.target.value === 'all' ? '' : event.target.value)
          }
        >
          <option value="all">Todas</option>
          <option value="true">Disponibles</option>
          <option value="false">No disponibles</option>
        </Select>
        <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters}>
          Limpiar
        </Button>
      </div>

      <div className="mt-6">
        {photosState.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-64" />
            ))}
          </div>
        ) : null}

        {!photosState.loading && photosState.error ? (
          <ErrorState message={photosState.error} onRetry={photosState.reload} />
        ) : null}

        {!photosState.loading && !photosState.error && photos.length === 0 ? (
          <EmptyState
            icon={Images}
            title={hasFilters ? 'Sin resultados' : 'Aún no hay fotografías'}
            description={
              hasFilters
                ? 'Prueba con otro evento u otra disponibilidad.'
                : 'Sube fotografías y asígnalas a un evento para empezar.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <LinkButton to={uploadLink}>Subir fotografías</LinkButton>
              )
            }
          />
        ) : null}

        {!photosState.loading && !photosState.error && photos.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-line bg-panel"
              >
                <div className="relative aspect-[4/3] bg-panel-soft">
                  <SmartImage
                    src={photo.storagePath}
                    alt={`Fotografía ${photo.code}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge tone={photo.available ? 'accent' : 'danger'}>
                      {photo.available ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-slate-400">{photo.code}</span>
                    <span className="text-sm font-semibold text-white">
                      {formatPrice(photo.price)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Pencil className="size-4" />}
                      onClick={() => setEditTarget(photo)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="size-4" />}
                      onClick={() => setDeleteTarget(photo)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {editTarget ? (
        <PhotoEditDialog
          key={editTarget.id}
          photo={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={photosState.reload}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar fotografía"
        description={`Se eliminará la fotografía ${deleteTarget?.code ?? ''} y su archivo físico. Si ya fue comprada en un pedido, el servidor impedirá el borrado.`}
        confirmLabel="Eliminar fotografía"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />
    </div>
  )
}
