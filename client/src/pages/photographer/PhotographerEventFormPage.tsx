import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { EventForm } from '@/components/photographer/EventForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { ApiError, eventsApi } from '@/lib/api'
import type { EventPayload } from '@/lib/api'
import type { ApiItem, EventItem } from '@/types/api'

export function PhotographerEventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, error, reload } = useApi<ApiItem<EventItem>>(
    isEdit && id ? `/api/events/${id}` : null,
  )
  const event = data?.data

  const handleSubmit = async (payload: EventPayload) => {
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await eventsApi.update(id, payload)
        toast('Evento actualizado', 'success')
      } else {
        await eventsApi.create(payload)
        toast('Evento creado', 'success')
      }
      navigate('/photographer/events')
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudo guardar el evento.'
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link
        to="/photographer/events"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a eventos
      </Link>

      <div className="mb-6 mt-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          {isEdit ? 'Editar evento' : 'Nuevo evento'}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {isEdit
            ? 'Actualiza los datos del evento. Los cambios se guardan en la base de datos.'
            : 'Completa los datos para crear un evento DEMO.'}
        </p>
      </div>

      {isEdit && loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : null}

      {isEdit && !loading && error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : null}

      {isEdit && !loading && !error && !event ? (
        <EmptyState
          title="Evento no encontrado"
          description="El evento que intentas editar no existe."
        />
      ) : null}

      {!isEdit || event ? (
        <EventForm
          key={event?.id ?? 'new'}
          initial={event}
          submitting={submitting}
          submitLabel={isEdit ? 'Guardar cambios' : 'Crear evento'}
          cancelTo="/photographer/events"
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}
