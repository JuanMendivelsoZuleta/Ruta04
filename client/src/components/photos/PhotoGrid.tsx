import { PhotoTile } from './PhotoTile'
import type { Photo } from '@/types/api'

export type PhotoGridProps = {
  photos: Photo[]
  onSelect: (photo: Photo) => void
}

export function PhotoGrid({ photos, onSelect }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoTile key={photo.id} photo={photo} onSelect={onSelect} />
      ))}
    </div>
  )
}
