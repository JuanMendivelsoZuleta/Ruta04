import { CalendarPlus, Camera, ImagePlus } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

const capabilities = [
  {
    icon: CalendarPlus,
    title: 'Gestionar eventos',
    description: 'Crear, editar y eliminar eventos deportivos.',
  },
  {
    icon: ImagePlus,
    title: 'Subir fotografías',
    description: 'Cargar imágenes y asociarlas a un evento.',
  },
  {
    icon: Camera,
    title: 'Administrar la galería',
    description: 'Editar precios, disponibilidad y eliminar fotos.',
  },
]

export function PhotographerPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-wrap items-center gap-3">
        <PageHeader
          eyebrow="Modo fotógrafo"
          title="Panel del fotógrafo"
          description="Acceso de demostración, no es autenticación real. La gestión completa se implementa en P8."
        />
        <Badge tone="accent">DEMO</Badge>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {capabilities.map((capability) => {
          const Icon = capability.icon
          return (
            <div key={capability.title} className="rounded-2xl border border-line bg-panel p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
                {capability.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">{capability.description}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-10">
        <EmptyState
          icon={Camera}
          title="Panel en la siguiente fase"
          description="El dashboard, la creación de eventos y la carga de fotografías se implementan en P8."
          action={
            <LinkButton to="/events" variant="secondary">
              Ver eventos DEMO
            </LinkButton>
          }
        />
      </div>
    </Container>
  )
}
