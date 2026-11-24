import { Compass } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function NotFoundPage() {
  return (
    <Container className="py-20 sm:py-28">
      <EmptyState
        icon={Compass}
        title="Página no encontrada"
        description="La ruta que buscas no existe o fue movida."
        action={<LinkButton to="/">Volver al inicio</LinkButton>}
      />
    </Container>
  )
}
