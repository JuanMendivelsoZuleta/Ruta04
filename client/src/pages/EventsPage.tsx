import { Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { useMemo, useState } from 'react'
import { EventCard } from '@/components/events/EventCard'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { PhotoTile } from '@/components/photos/PhotoTile'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SPORT_OPTIONS } from '@/lib/format'
import type { ApiList, EventItem, Photo } from '@/types/api'

export function EventsPage() {
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState('')
  const [codeQuery, setCodeQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const debouncedCode = useDebouncedValue(codeQuery.trim(), 300)

  const path = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (sport) params.set('sport', sport)
    const queryString = params.toString()
    return `/api/events${queryString ? `?${queryString}` : ''}`
  }, [debouncedQuery, sport])

  const { data, loading, error, reload } = useApi<ApiList<EventItem>>(path)
  const events = data?.data ?? []
  const hasFilters = Boolean(debouncedQuery || sport)

  const codePath = debouncedCode
    ? `/api/photos?code=${encodeURIComponent(debouncedCode)}`
    : null
  const {
    data: codeData,
    loading: codeLoading,
    error: codeError,
    reload: reloadCode,
  } = useApi<ApiList<Photo>>(codePath)
  const codePhotos = codeData?.data ?? []

  const clearFilters = () => {
    setQuery('')
    setSport('')
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Explorar"
        title="Eventos deportivos"
        description="Busca por nombre o ubicación y filtra por categoría deportiva."
      />

      <div className="mt-8 grid gap-4 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end sm:p-5">
        <Input
          label="Buscar"
          placeholder="Nombre o ubicación del evento"
          leftIcon={<Search className="size-4" />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          label="Deporte"
          value={sport}
          onChange={(event) => setSport(event.target.value)}
        >
          <option value="">Todos los deportes</option>
          {SPORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          onClick={clearFilters}
          disabled={!hasFilters}
          leftIcon={<SlidersHorizontal className="size-4" />}
        >
          Limpiar
        </Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-80" />
            ))}
          </div>
        ) : null}

        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}

        {!loading && !error && events.length === 0 ? (
          <EmptyState
            icon={Search}
            title={hasFilters ? 'Sin resultados' : 'Aún no hay eventos'}
            description={
              hasFilters
                ? 'Prueba con otro nombre, ubicación o deporte.'
                : 'Ejecuta la carga de datos DEMO para ver eventos aquí.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {events.length} evento{events.length === 1 ? '' : 's'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <section className="mt-14 border-t border-line pt-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Búsqueda por código
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
            Encuentra una fotografía
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Usa el código de la fotografía (por ejemplo, DEMO-RUN-01) para ubicarla en
            su evento.
          </p>
        </div>

        <div className="mt-5 max-w-xl">
          <Input
            label="Código de fotografía"
            placeholder="Ej. DEMO-RUN-01"
            leftIcon={<Search className="size-4" />}
            value={codeQuery}
            onChange={(event) => setCodeQuery(event.target.value)}
            hint="La búsqueda se ejecuta sobre los datos reales del backend."
          />
        </div>

        <div className="mt-6">
          {!debouncedCode ? (
            <p className="text-sm text-slate-500">
              Escribe un código para buscar fotografías.
            </p>
          ) : null}

          {codeLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="aspect-[4/3]" />
              ))}
            </div>
          ) : null}

          {!codeLoading && codeError ? (
            <ErrorState message={codeError} onRetry={reloadCode} />
          ) : null}

          {!codeLoading && !codeError && debouncedCode && codePhotos.length === 0 ? (
            <p className="text-sm text-slate-500">
              No encontramos fotografías con ese código.
            </p>
          ) : null}

          {!codeLoading && !codeError && codePhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {codePhotos.map((photo) => (
                <Link
                  key={photo.id}
                  to={`/events/${photo.eventId}`}
                  className="block transition-transform hover:-translate-y-0.5"
                >
                  <PhotoTile photo={photo} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </Container>
  )
}
