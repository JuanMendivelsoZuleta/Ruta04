import { ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatPrice } from '@/lib/format'
import type { Photo } from '@/types/api'

export type LightboxProps = {
  photo: Photo | null
  eventName: string
  inCart: boolean
  onClose: () => void
  onAdd: (photo: Photo) => void
}

export function Lightbox({ photo, eventName, inCart, onClose, onAdd }: LightboxProps) {
  if (!photo) return null

  return (
    <Modal open onClose={onClose} label={`Fotografía ${photo.code}`}>
      <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
        <div className="bg-night">
          <SmartImage
            src={photo.storagePath}
            alt={`Fotografía ${photo.code}`}
            className="aspect-[4/3] w-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={photo.available ? 'accent' : 'danger'}>
              {photo.available ? 'Disponible' : 'No disponible'}
            </Badge>
            <Badge tone="neutral">DEMO</Badge>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Evento</p>
            <h2 className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide text-white">
              {eventName}
            </h2>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-slate-400">Código</dt>
              <dd className="font-mono text-slate-200">{photo.code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Precio</dt>
              <dd className="font-semibold text-white">{formatPrice(photo.price)}</dd>
            </div>
          </dl>

          <div className="mt-auto">
            <Button
              className="w-full"
              leftIcon={<ShoppingBag className="size-4" />}
              disabled={!photo.available || inCart}
              onClick={() => onAdd(photo)}
            >
              {inCart
                ? 'En el carrito'
                : photo.available
                  ? 'Agregar al carrito'
                  : 'No disponible'}
            </Button>
            <p className="mt-3 text-xs text-slate-500">
              Compra de demostración. No se procesa ningún pago real.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
