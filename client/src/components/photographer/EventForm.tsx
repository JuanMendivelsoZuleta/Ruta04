import { useState } from 'react'
import type { FormEvent } from 'react'
import { LinkButton } from '@/components/ui/LinkButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { EventPayload } from '@/lib/api'
import { SPORT_OPTIONS } from '@/lib/format'
import type { EventItem } from '@/types/api'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

type FormErrors = {
  name?: string
  location?: string
  date?: string
}

function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export type EventFormProps = {
  initial?: EventItem | null
  submitting: boolean
  submitLabel: string
  cancelTo: string
  onSubmit: (payload: EventPayload) => void
}

export function EventForm({
  initial,
  submitting,
  submitLabel,
  cancelTo,
  onSubmit,
}: EventFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [sportCategory, setSportCategory] = useState(
    initial?.sportCategory ?? SPORT_OPTIONS[0]?.value ?? 'RUNNING',
  )
  const [location, setLocation] = useState(initial?.location ?? '')
  const [date, setDate] = useState(toDateTimeLocal(initial?.date))
  const [status, setStatus] = useState(initial?.status ?? 'ACTIVE')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (name.trim().length < 2) {
      nextErrors.name = 'El nombre debe tener al menos 2 caracteres.'
    }
    if (location.trim().length < 2) {
      nextErrors.location = 'La ubicación debe tener al menos 2 caracteres.'
    }
    const parsedDate = new Date(date)
    if (!date || Number.isNaN(parsedDate.getTime())) {
      nextErrors.date = 'Selecciona una fecha y hora válidas.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      name: name.trim(),
      sportCategory,
      location: location.trim(),
      date: parsedDate.toISOString(),
      description: description.trim() ? description.trim() : null,
      status,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-2 sm:p-6"
      noValidate
    >
      <Input
        label="Nombre del evento"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        placeholder="Ej. Maratón Nocturno"
      />
      <Select
        label="Categoría deportiva"
        value={sportCategory}
        onChange={(event) => setSportCategory(event.target.value)}
      >
        {SPORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        label="Ubicación"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        error={errors.location}
        placeholder="Ciudad, departamento"
      />
      <Input
        label="Fecha y hora"
        type="datetime-local"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        error={errors.date}
      />
      <Select
        label="Estado"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <div className="sm:col-span-2">
        <Textarea
          label="Descripción (opcional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descripción del evento para la galería pública"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
        <LinkButton to={cancelTo} variant="secondary">
          Cancelar
        </LinkButton>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
