import { useState } from 'react'
import { useToast } from '@/components/feedback/toast-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { ApiError, photosApi } from '@/lib/api'
import type { Photo } from '@/types/api'

export type PhotoEditDialogProps = {
  photo: Photo
  onClose: () => void
  onSaved: () => void
}

export function PhotoEditDialog({ photo, onClose, onSaved }: PhotoEditDialogProps) {
  const { toast } = useToast()
  const [price, setPrice] = useState(String(photo.price))
  const [available, setAvailable] = useState(photo.available ? 'true' : 'false')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const parsedPrice = Number(price)
    if (price.trim() === '' || !Number.isInteger(parsedPrice) || parsedPrice < 0) {
      setError('El precio debe ser un entero mayor o igual a 0.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await photosApi.update(photo.id, {
        price: parsedPrice,
        available: available === 'true',
      })
      toast('Fotografía actualizada', 'success')
      onSaved()
      onClose()
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : 'No se pudo actualizar la fotografía.'
      toast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} label={`Editar fotografía ${photo.code}`}>
      <div className="p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
          Editar fotografía
        </h2>
        <p className="mt-1 font-mono text-xs text-slate-500">{photo.code}</p>

        <div className="mt-5 space-y-4">
          <Input
            label="Precio (COP)"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            error={error ?? undefined}
          />
          <Select
            label="Disponibilidad"
            value={available}
            onChange={(event) => setAvailable(event.target.value)}
          >
            <option value="true">Disponible</option>
            <option value="false">No disponible</option>
          </Select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
