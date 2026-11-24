import { Compass, Search } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LinkButton } from '@/components/ui/LinkButton'
import { Select } from '@/components/ui/Select'
import { SPORT_OPTIONS } from '@/lib/format'

export function EventsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Explorar"
        title="Eventos deportivos"
        description="Busca por nombre, ubicación o deporte. La exploración completa se activa en la siguiente fase."
      />

      <div className="mt-8 grid gap-4 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-[1fr_220px] sm:p-5">
        <Input
          label="Buscar"
          placeholder="Nombre o ubicación del evento"
          leftIcon={<Search className="size-4" />}
          disabled
        />
        <Select label="Deporte" defaultValue="" disabled>
          <option value="">Todos los deportes</option>
          {SPORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Vista previa del sistema de filtros; la búsqueda se conecta a la API en P7.
      </p>

      <div className="mt-10">
        <EmptyState
          icon={Compass}
          title="Exploración en la siguiente fase"
          description="La búsqueda, los filtros y la galería completa se conectarán a la API en P7."
          action={
            <LinkButton to="/" variant="secondary">
              Volver al inicio
            </LinkButton>
          }
        />
      </div>
    </Container>
  )
}
