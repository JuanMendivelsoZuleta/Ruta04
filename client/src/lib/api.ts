import type {
  ApiErrorBody,
  ApiItem,
  ApiList,
  EventItem,
  Order,
  Photo,
} from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  readonly status: number
  readonly details?: string[]

  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : undefined

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | undefined
    throw new ApiError(
      response.status,
      errorBody?.error ?? 'Ocurrió un error inesperado',
      errorBody?.details,
    )
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, body: FormData) =>
    request<T>(path, { method: 'POST', body }),
}

export type EventPayload = {
  name: string
  sportCategory: string
  location: string
  date: string
  description?: string | null
  coverImage?: string | null
  status?: string
}

export const eventsApi = {
  list: (params: { q?: string; sport?: string } = {}) => {
    const search = new URLSearchParams()
    if (params.q) search.set('q', params.q)
    if (params.sport) search.set('sport', params.sport)
    const query = search.toString()
    return api.get<ApiList<EventItem>>(`/api/events${query ? `?${query}` : ''}`)
  },
  get: (id: string) => api.get<ApiItem<EventItem>>(`/api/events/${id}`),
  photos: (id: string) => api.get<ApiList<Photo>>(`/api/events/${id}/photos`),
  create: (input: EventPayload) =>
    api.post<ApiItem<EventItem>>('/api/events', input),
  update: (id: string, input: Partial<EventPayload>) =>
    api.patch<ApiItem<EventItem>>(`/api/events/${id}`, input),
  remove: (id: string) => api.delete<void>(`/api/events/${id}`),
}

export const photosApi = {
  get: (id: string) => api.get<ApiItem<Photo>>(`/api/photos/${id}`),
  list: (params: { eventId?: string; available?: boolean; code?: string } = {}) => {
    const search = new URLSearchParams()
    if (params.eventId) search.set('eventId', params.eventId)
    if (params.available !== undefined) search.set('available', String(params.available))
    if (params.code) search.set('code', params.code)
    const query = search.toString()
    return api.get<ApiList<Photo>>(`/api/photos${query ? `?${query}` : ''}`)
  },
  update: (id: string, input: { price?: number; available?: boolean }) =>
    api.patch<ApiItem<Photo>>(`/api/photos/${id}`, input),
  remove: (id: string) => api.delete<void>(`/api/photos/${id}`),
  upload: (eventId: string, form: FormData) =>
    api.upload<ApiList<Photo>>(`/api/events/${eventId}/photos`, form),
}

export const ordersApi = {
  create: (input: {
    customerName: string
    customerEmail: string
    photoIds: string[]
  }) => api.post<ApiItem<Order>>('/api/orders', input),
  listByEmail: (email: string) =>
    api.get<ApiList<Order>>(`/api/orders?email=${encodeURIComponent(email)}`),
  get: (orderNumber: string) =>
    api.get<ApiItem<Order>>(`/api/orders/${encodeURIComponent(orderNumber)}`),
}
