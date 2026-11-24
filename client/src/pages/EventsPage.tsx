import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventCard } from '@/components/events/EventCard'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SPORT_OPTIONS } from '@/lib/format'
import type { ApiList, EventItem } from '@/types/api'

export function EventsPage() {
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)

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
    </Container>
  )
}
