import { ArrowLeft, CalendarDays, Images, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { Container } from '@/components/layout/Container'
import { Lightbox } from '@/components/photos/Lightbox'
import { PhotoGrid } from '@/components/photos/PhotoGrid'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCart } from '@/context/cart-context'
import { useApi } from '@/hooks/useApi'
import { formatCategory, formatDate } from '@/lib/format'
import type { ApiItem, ApiList, EventItem, Photo } from '@/types/api'

export function EventDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const cart = useCart()
  const [selected, setSelected] = useState<Photo | null>(null)

  const { data, loading, error, reload } = useApi<ApiItem<EventItem>>(
    id ? `/api/events/${id}` : null,
  )
  const {
    data: photosData,
    loading: photosLoading,
    error: photosError,
    reload: reloadPhotos,
  } = useApi<ApiList<Photo>>(id ? `/api/events/${id}/photos` : null)

  const event = data?.data
  const photos = photosData?.data ?? []

  const handleAdd = (photo: Photo) => {
    if (!event || !photo.available) return
    if (cart.has(photo.id)) {
      toast('Esta fotografía ya está en el carrito', 'info')
      return
    }
    cart.add({
      photoId: photo.id,
      code: photo.code,
      price: photo.price,
      storagePath: photo.storagePath,
      eventId: photo.eventId,
      eventName: event.name,
      available: photo.available,
    })
    toast(`Fotografía ${photo.code} agregada al carrito`, 'success')
    setSelected(null)
  }

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

          <div className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Galería
              </h2>
              <p className="text-sm text-slate-500">
                {photos.length} fotografía{photos.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-4">
              {photosLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} className="aspect-[4/3]" />
                  ))}
                </div>
              ) : null}

              {!photosLoading && photosError ? (
                <ErrorState message={photosError} onRetry={reloadPhotos} />
              ) : null}

              {!photosLoading && !photosError && photos.length === 0 ? (
                <EmptyState
                  icon={Images}
                  title="Sin fotografías todavía"
                  description="Este evento aún no tiene fotografías publicadas."
                />
              ) : null}

              {!photosLoading && !photosError && photos.length > 0 ? (
                <PhotoGrid photos={photos} onSelect={setSelected} />
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <Lightbox
        photo={selected}
        eventName={event?.name ?? ''}
        inCart={selected ? cart.has(selected.id) : false}
        onClose={() => setSelected(null)}
        onAdd={handleAdd}
      />
    </Container>
  )
}
