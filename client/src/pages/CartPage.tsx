import { AlertTriangle, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCart } from '@/context/cart-context'
import { useCartValidation } from '@/hooks/useCartValidation'
import { formatPrice } from '@/lib/format'

export function CartPage() {
  const { items, subtotal, remove, clear } = useCart()
  const { checking, unavailable, validationError, retry } = useCartValidation()
  const { toast } = useToast()

  const handleRemove = (photoId: string, code: string) => {
    remove(photoId)
    toast(`Fotografía ${code} eliminada del carrito`, 'info')
  }

  const handleClear = () => {
    clear()
    toast('Carrito vaciado', 'info')
  }

  const blocked = unavailable.length > 0
  const canCheckout = !blocked && !checking && !validationError

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Carrito"
        title="Tu selección"
        description="Revisa tus fotografías antes de completar la compra DEMO."
      />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Tu carrito está vacío"
            description="Explora los eventos DEMO y selecciona fotografías para simular una compra."
            action={<LinkButton to="/events">Explorar eventos</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.photoId}
                className="flex gap-4 rounded-2xl border border-line bg-panel p-3 sm:p-4"
              >
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-panel-soft">
                  <SmartImage
                    src={item.storagePath}
                    alt={`Fotografía ${item.code}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/events/${item.eventId}`}
                        className="text-sm font-semibold text-white transition-colors hover:text-accent"
                      >
                        {item.eventName}
                      </Link>
                      {!item.available ? <Badge tone="danger">No disponible</Badge> : null}
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500">{item.code}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">
                      {formatPrice(item.price)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="size-4" />}
                      onClick={() => handleRemove(item.photoId, item.code)}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Vaciar carrito
              </Button>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
              Resumen
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Fotografías</dt>
                <dd className="text-slate-200">{items.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="text-slate-200">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="font-semibold text-white">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              Compra DEMO: no se procesa ningún pago real.
            </p>

            {checking ? (
              <p className="mt-4 text-xs text-slate-400">
                Actualizando precios y disponibilidad…
              </p>
            ) : null}

            {blocked ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Una o más fotografías ya no están disponibles. Quítalas para continuar.
                </span>
              </div>
            ) : null}

            {validationError ? (
              <div
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                role="alert"
              >
                <p>{validationError}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={retry}>
                  Reintentar
                </Button>
              </div>
            ) : null}

            <div className="mt-5">
              {canCheckout ? (
                <LinkButton to="/checkout" className="w-full">
                  Ir a checkout
                </LinkButton>
              ) : (
                <Button className="w-full" disabled>
                  {checking ? 'Actualizando…' : 'Ir a checkout'}
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}
    </Container>
  )
}
