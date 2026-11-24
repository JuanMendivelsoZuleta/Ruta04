import { ArrowLeft, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LinkButton } from '@/components/ui/LinkButton'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { ApiError, eventsApi, photosApi } from '@/lib/api'
import type { ApiList, EventItem } from '@/types/api'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 5 * 1024 * 1024
const MAX_FILES = 20

type SelectedFile = {
  file: File
  url: string
}

type FormErrors = {
  event?: string
  price?: string
  files?: string
}

export function PhotographerUploadPage() {
  const [searchParams] = useSearchParams()
  const initialEventId = searchParams.get('eventId') ?? ''
  const eventsState = useApi<ApiList<EventItem>>('/api/events')
  const events = eventsState.data?.data ?? []
  const navigate = useNavigate()
  const { toast } = useToast()

  const [eventId, setEventId] = useState(initialEventId)
  const [price, setPrice] = useState('')
  const [selected, setSelected] = useState<SelectedFile[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [uploading, setUploading] = useState(false)
  const selectedRef = useRef(selected)

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    return () => {
      selectedRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  const removeFile = (url: string) => {
    URL.revokeObjectURL(url)
    setSelected((current) => current.filter((item) => item.url !== url))
  }

  const clearFiles = () => {
    selected.forEach((item) => URL.revokeObjectURL(item.url))
    setSelected([])
  }

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (incoming.length === 0) return

    const problems: string[] = []
    const next: SelectedFile[] = []

    for (const file of incoming) {
      if (!ALLOWED_TYPES.has(file.type)) {
        problems.push(`${file.name}: formato no permitido`)
        continue
      }
      if (file.size > MAX_SIZE) {
        problems.push(`${file.name}: supera 5 MB`)
        continue
      }
      if (selected.length + next.length >= MAX_FILES) {
        problems.push(`Máximo ${MAX_FILES} archivos por carga`)
        break
      }
      next.push({ file, url: URL.createObjectURL(file) })
    }

    if (next.length > 0) {
      setSelected((current) => [...current, ...next])
    }
    setErrors((current) => ({
      ...current,
      files: problems.length > 0 ? problems.join('. ') : undefined,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!eventId) nextErrors.event = 'Selecciona un evento.'
    const parsedPrice = Number(price)
    if (price.trim() === '' || !Number.isInteger(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = 'Ingresa un precio entero mayor o igual a 0.'
    }
    if (selected.length === 0) {
      nextErrors.files = 'Selecciona al menos una fotografía.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const form = new FormData()
    form.append('price', String(parsedPrice))
    selected.forEach((item) => form.append('files', item.file, item.file.name))

    setUploading(true)
    try {
      const { data: uploaded } = await photosApi.upload(eventId, form)

      // Si el evento no tiene portada, se usa la primera foto subida.
      const eventResponse = await eventsApi.get(eventId).catch(() => null)
      const first = uploaded[0]
      if (eventResponse?.data && !eventResponse.data.coverImage && first) {
        await eventsApi
          .update(eventId, { coverImage: first.storagePath })
          .catch(() => undefined)
      }

      toast(
        `${uploaded.length} fotografía${uploaded.length === 1 ? '' : 's'} subida${uploaded.length === 1 ? '' : 's'}`,
        'success',
      )
      clearFiles()
      navigate(`/photographer/photos?eventId=${encodeURIComponent(eventId)}`)
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudieron subir las fotografías.'
      toast(message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Link
        to="/photographer/photos"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a fotografías
      </Link>

      <div className="mb-6 mt-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Subir fotografías
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Selecciona una o varias imágenes, asígnalas a un evento y define el precio.
        </p>
      </div>

      {eventsState.loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : null}

      {!eventsState.loading && eventsState.error ? (
        <ErrorState message={eventsState.error} onRetry={eventsState.reload} />
      ) : null}

      {!eventsState.loading && !eventsState.error && events.length === 0 ? (
        <EmptyState
          title="Primero crea un evento"
          description="Necesitas un evento para asociar las fotografías."
          action={
            <LinkButton to="/photographer/events/new">Crear evento</LinkButton>
          }
        />
      ) : null}

      {!eventsState.loading && !eventsState.error && events.length > 0 ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-2xl border border-line bg-panel p-5 sm:p-6"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Evento"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              error={errors.event}
            >
              <option value="">Selecciona un evento</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
            <Input
              label="Precio por fotografía (COP)"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              error={errors.price}
              placeholder="Ej. 15000"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Archivos
            </span>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-night/40 px-6 py-10 text-center transition-colors hover:border-accent/60">
              <Upload className="size-6 text-accent" aria-hidden="true" />
              <span className="mt-3 text-sm font-medium text-white">
                Seleccionar imágenes
              </span>
              <span className="mt-1 text-xs text-slate-500">
                JPG, PNG o WEBP · hasta 5 MB por archivo · máximo 20
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className="sr-only"
                onChange={handleFiles}
                disabled={uploading}
              />
            </label>
            {errors.files ? (
              <p className="mt-2 text-xs text-red-400">{errors.files}</p>
            ) : null}
          </div>

          {selected.length > 0 ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  {selected.length} archivo{selected.length === 1 ? '' : 's'} seleccionado
                  {selected.length === 1 ? '' : 's'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  Quitar todos
                </Button>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {selected.map((item) => (
                  <li
                    key={item.url}
                    className="relative overflow-hidden rounded-xl border border-line bg-panel-soft"
                  >
                    <img
                      src={item.url}
                      alt={item.file.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="truncate text-xs text-slate-300">{item.file.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(item.url)}
                      aria-label={`Quitar ${item.file.name}`}
                      className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-night/80 text-slate-300 transition-colors hover:text-white"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <LinkButton to="/photographer/photos" variant="secondary">
              Cancelar
            </LinkButton>
            <Button type="submit" loading={uploading} leftIcon={<Upload className="size-4" />}>
              Subir fotografías
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
