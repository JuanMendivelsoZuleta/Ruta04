import { ShoppingBag } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function CartPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Carrito"
        title="Tu selección"
        description="Aquí verás las fotografías que elijas. El carrito persistente y el checkout DEMO se implementan en P7."
      />

      <div className="mt-10">
        <EmptyState
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          description="Explora los eventos DEMO y selecciona fotografías para simular una compra."
          action={<LinkButton to="/events">Explorar eventos</LinkButton>}
        />
      </div>
    </Container>
  )
}
