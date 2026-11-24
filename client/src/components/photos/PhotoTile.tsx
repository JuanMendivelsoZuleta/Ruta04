import { Badge } from '@/components/ui/Badge'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import type { Photo } from '@/types/api'

export type PhotoTileProps = {
  photo: Photo
  className?: string
}

export function PhotoTile({ photo, className }: PhotoTileProps) {
  return (
    <figure
      className={cn(
        'group overflow-hidden rounded-2xl border border-line bg-panel',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-soft">
        <SmartImage
          src={photo.storagePath}
          alt={`Fotografía ${photo.code}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone={photo.available ? 'accent' : 'danger'}>
            {photo.available ? 'Disponible' : 'No disponible'}
          </Badge>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-3 p-4">
        <span className="font-mono text-xs tracking-wide text-slate-400">
          {photo.code}
        </span>
        <span className="text-sm font-semibold text-white">
          {formatPrice(photo.price)}
        </span>
      </figcaption>
    </figure>
  )
}
