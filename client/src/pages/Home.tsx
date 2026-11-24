import { ArrowRight, Camera, Images, Search, ShoppingBag, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EventCard } from '@/components/events/EventCard'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LinkButton } from '@/components/ui/LinkButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApi } from '@/hooks/useApi'
import type { ApiList, EventItem } from '@/types/api'

const steps = [
  {
    icon: Search,
    title: 'Encuentra tu evento',
    description: 'Explora eventos deportivos por categoría y ubicación.',
  },
  {
    icon: Images,
    title: 'Ubica tu fotografía',
    description: 'Consulta la galería y amplía cada imagen.',
  },
  {
    icon: ShoppingBag,
    title: 'Compra en modo DEMO',
    description: 'Simula el checkout sin procesar pagos reales.',
  },
]

export function Home() {
  const { data, loading, error, reload } = useApi<ApiList<EventItem>>('/api/events')
  const [heroFailed, setHeroFailed] = useState(false)

  const events = data?.data.slice(0, 3) ?? []
  const heroImage = events[0]?.coverImage ?? null

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        {heroImage && !heroFailed ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            onError={() => setHeroFailed(true)}
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-br from-night via-night/85 to-night/40"
          aria-hidden="true"
        />

        <Container className="relative py-16 sm:py-24 lg:py-28">
          <Badge tone="accent">Marketplace DEMO de fotografía deportiva</Badge>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-6xl lg:text-7xl">
            Tu carrera. Tu momento.{' '}
            <span className="text-accent">Tu fotografía.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Encuentra las fotos de tu evento deportivo, amplíalas y compra en modo
            demostración. Sin pagos reales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/events" size="lg" leftIcon={<Search className="size-5" />}>
              Explorar eventos
            </LinkButton>
            <LinkButton
              to="/photographer"
              size="lg"
              variant="secondary"
              leftIcon={<Camera className="size-5" />}
            >
              Modo fotógrafo
            </LinkButton>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-500">
            Proyecto académico · datos e imágenes DEMO
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Eventos DEMO
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
                Fotografías destacadas
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Ver todos
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-80" />
                ))}
              </div>
            ) : null}

            {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && events.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Aún no hay eventos"
                description="Ejecuta la carga de datos DEMO para ver eventos aquí."
              />
            ) : null}

            {!loading && !error && events.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-panel/30 py-14">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="rounded-2xl border border-line bg-panel p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{step.description}</p>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    </>
  )
}
