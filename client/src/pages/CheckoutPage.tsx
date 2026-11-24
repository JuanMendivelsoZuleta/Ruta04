import { AlertTriangle, CreditCard } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useToast } from '@/components/feedback/toast-context'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LinkButton } from '@/components/ui/LinkButton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCart } from '@/context/cart-context'
import { useCartValidation } from '@/hooks/useCartValidation'
import { ApiError, ordersApi } from '@/lib/api'
import { formatPrice } from '@/lib/format'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormErrors = {
  name?: string
  email?: string
}

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const { checking, unavailable, validationError, retry } = useCartValidation()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const blocked = unavailable.length > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (name.trim().length < 2) {
      nextErrors.name = 'Ingresa tu nombre (mínimo 2 caracteres).'
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const { data: order } = await ordersApi.create({
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        photoIds: items.map((item) => item.photoId),
      })
      clear()
      toast('Pedido DEMO creado correctamente', 'success')
      navigate(`/orders/${order.orderNumber}`, { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo completar el pedido. Inténtalo de nuevo.'
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Checkout DEMO"
        title="Confirmar compra"
        description="Compra de demostración: no se procesa ningún pago real."
      />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={CreditCard}
            title="No hay fotografías para comprar"
            description="Agrega fotografías desde la galería de un evento para continuar."
            action={<LinkButton to="/events">Explorar eventos</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-line bg-panel p-5 sm:p-6"
            noValidate
          >
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
              Datos del comprador
            </h2>

            <Input
              label="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              placeholder="Nombre y apellido"
              autoComplete="name"
            />

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              hint="Lo usarás para consultar tus compras."
              placeholder="tu@correo.com"
              autoComplete="email"
            />

            {blocked ? (
              <div
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  Una o más fotografías ya no están disponibles. Vuelve al carrito y
                  quítalas para continuar.
                </span>
              </div>
            ) : null}

            {validationError ? (
              <div
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                role="alert"
              >
                <p>{validationError}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={retry}>
                  Reintentar
                </Button>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              disabled={checking || blocked || Boolean(validationError)}
            >
              {checking ? 'Actualizando precios…' : 'Completar compra DEMO'}
            </Button>
            <p className="text-xs text-slate-500">
              Al confirmar, se crea un pedido DEMO. No se cobra dinero ni se solicita
              información de pago.
            </p>
          </form>

          <aside className="h-fit rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
              Resumen del pedido
            </h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.photoId} className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-panel-soft">
                    <SmartImage
                      src={item.storagePath}
                      alt={`Fotografía ${item.code}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-200">{item.eventName}</p>
                    <p className="font-mono text-xs text-slate-500">{item.code}</p>
                  </div>
                  <span className="text-sm text-slate-200">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="text-slate-200">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="font-semibold text-white">{formatPrice(subtotal)}</dd>
              </div>
            </dl>

            <p className="mt-3 text-xs text-slate-500">
              Los precios y la disponibilidad se validan en el servidor al confirmar.
            </p>

            <div className="mt-5">
              <LinkButton to="/cart" variant="secondary" className="w-full">
                Volver al carrito
              </LinkButton>
            </div>
          </aside>
        </div>
      )}
    </Container>
  )
}
