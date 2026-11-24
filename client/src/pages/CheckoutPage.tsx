import { CreditCard } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function CheckoutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Checkout DEMO"
        title="Confirmar compra"
        description="Formulario de compra de demostración. No se procesan pagos reales."
      />

      <div className="mt-10">
        <EmptyState
          icon={CreditCard}
          title="Checkout en la siguiente fase"
          description="La validación del comprador, el resumen del pedido y la confirmación DEMO se implementan en P7."
          action={
            <LinkButton to="/cart" variant="secondary">
              Volver al carrito
            </LinkButton>
          }
        />
      </div>
    </Container>
  )
}
