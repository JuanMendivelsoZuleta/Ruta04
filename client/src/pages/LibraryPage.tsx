import { ReceiptText } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function LibraryPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Mis compras"
        title="Biblioteca de compras"
        description="Consulta de pedidos y fotografías adquiridas por correo. Disponible en la siguiente fase."
      />

      <div className="mt-10">
        <EmptyState
          icon={ReceiptText}
          title="Biblioteca en la siguiente fase"
          description="La consulta de pedidos DEMO y las fotografías adquiridas se implementan en P7."
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
