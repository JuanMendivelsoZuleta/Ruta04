import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

export type SmartImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}

/**
 * Imagen con fallback local: si no hay src o la carga falla,
 * muestra un bloque neutro en lugar de un icono roto.
 */
export function SmartImage({ src, alt, className, fallbackClassName }: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-panel-soft via-panel to-night text-slate-600',
          className,
          fallbackClassName,
        )}
      >
        <ImageOff className="size-8" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
