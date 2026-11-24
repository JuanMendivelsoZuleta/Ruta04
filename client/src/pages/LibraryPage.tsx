import { ReceiptText, Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useApi } from '@/hooks/useApi'
import { formatDate, formatPrice } from '@/lib/format'
import type { ApiList, Order } from '@/types/api'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STORAGE_KEY = 'ruta04.libraryEmail'

function readStoredEmail(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function LibraryPage() {
  const [initialEmail] = useState(readStoredEmail)
  const [email, setEmail] = useState(initialEmail)
  const [submittedEmail, setSubmittedEmail] = useState(
    EMAIL_PATTERN.test(initialEmail) ? initialEmail : '',
  )
  const [formError, setFormError] = useState<string | null>(null)

  const { data, loading, error, reload } = useApi<ApiList<Order>>(
    submittedEmail ? `/api/orders?email=${encodeURIComponent(submittedEmail)}` : null,
  )
  const orders = data?.data ?? []

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalized)) {
      setFormError('Ingresa un correo electrónico válido.')
      return
    }
    setFormError(null)
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized)
    } catch {
      // Sin persistencia si el almacenamiento no está disponible.
    }
    if (normalized === submittedEmail) {
      reload()
    } else {
      setSubmittedEmail(normalized)
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Mis compras"
        title="Biblioteca de compras"
        description="Consulta los pedidos DEMO y las fotografías adquiridas con tu correo."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 sm:flex-row sm:items-end sm:p-5"
        noValidate
      >
        <div className="flex-1">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            leftIcon={<Search className="size-4" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={formError ?? undefined}
            autoComplete="email"
          />
        </div>
        <Button type="submit" loading={loading}>
          Consultar
        </Button>
      </form>

      <div className="mt-8">
        {!submittedEmail ? (
          <EmptyState
            icon={ReceiptText}
            title="Consulta tus compras"
            description="Ingresa el correo con el que completaste un pedido DEMO para ver tus fotografías adquiridas."
          />
        ) : null}

        {submittedEmail && loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[0, 1].map((item) => (
              <Skeleton key={item} className="h-56" />
            ))}
          </div>
        ) : null}

        {submittedEmail && !loading && error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : null}

        {submittedEmail && !loading && !error && orders.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Sin pedidos para ese correo"
            description="No encontramos compras DEMO asociadas. Verifica el correo o realiza una compra de demostración."
          />
        ) : null}

        {submittedEmail && !loading && !error && orders.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {orders.length} pedido{orders.length === 1 ? '' : 's'} encontrado
              {orders.length === 1 ? '' : 's'}
            </p>
            <div className="grid gap-5 lg:grid-cols-2">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-line bg-panel p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-slate-500">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(order.createdAt)} · {order.items.length} foto
                        {order.items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="accent">DEMO</Badge>
                      <Badge tone="neutral">{order.status}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-line bg-panel-soft"
                      >
                        <SmartImage
                          src={item.photo?.storagePath}
                          alt={`Fotografía ${item.photo?.code ?? item.photoId}`}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <p className="truncate p-2 font-mono text-[10px] text-slate-500">
                          {item.photo?.code ?? item.photoId}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <span className="text-sm font-semibold text-white">
                      Total: {formatPrice(order.total)}
                    </span>
                    <Link
                      to={`/orders/${order.orderNumber}`}
                      className="text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Container>
  )
}
