import { CheckCircle2, ReceiptText } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LinkButton } from '@/components/ui/LinkButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { SmartImage } from '@/components/ui/SmartImage'
import { useApi } from '@/hooks/useApi'
import { formatDate, formatPrice } from '@/lib/format'
import type { ApiItem, Order } from '@/types/api'

export function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { data, loading, error, reload } = useApi<ApiItem<Order>>(
    orderNumber ? `/api/orders/${encodeURIComponent(orderNumber)}` : null,
  )
  const order = data?.data

  return (
    <Container className="py-12 sm:py-16">
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ReceiptText className="size-4" aria-hidden="true" />
        Ir a mis compras
      </Link>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : null}

      {!loading && !error && !order ? (
        <div className="mt-8">
          <EmptyState
            icon={ReceiptText}
            title="Pedido no encontrado"
            description="El número de pedido no existe."
          />
        </div>
      ) : null}

      {order ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
            <CheckCircle2 className="mt-0.5 size-6 text-accent" aria-hidden="true" />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
                Pedido confirmado
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Este es un pedido DEMO; no se procesó ningún pago real.
              </p>
            </div>
            <Badge tone="accent">DEMO</Badge>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                Fotografías adquiridas
              </h2>
              <ul className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-panel p-3"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-panel-soft">
                      <SmartImage
                        src={item.photo?.storagePath}
                        alt={`Fotografía ${item.photo?.code ?? item.photoId}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-slate-400">
                        {item.photo?.code ?? item.photoId}
                      </p>
                      {item.photo?.eventId ? (
                        <Link
                          to={`/events/${item.photo.eventId}`}
                          className="text-xs text-slate-500 transition-colors hover:text-accent"
                        >
                          Ver evento
                        </Link>
                      ) : null}
                    </div>
                    <span className="text-sm text-slate-200">
                      {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-panel p-5">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
                Resumen
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Número</dt>
                  <dd className="font-mono text-slate-200">{order.orderNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Comprador</dt>
                  <dd className="text-slate-200">{order.customerName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Correo</dt>
                  <dd className="break-all text-right text-slate-200">{order.customerEmail}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Fecha</dt>
                  <dd className="text-slate-200">{formatDate(order.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-slate-400">Subtotal</dt>
                  <dd className="text-slate-200">{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-white">Total</dt>
                  <dd className="font-semibold text-white">{formatPrice(order.total)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2">
                <LinkButton to="/library" className="w-full">
                  Ir a mis compras
                </LinkButton>
                <LinkButton to="/events" variant="secondary" className="w-full">
                  Seguir explorando
                </LinkButton>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
