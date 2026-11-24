export type SportCategory =
  | 'RUNNING'
  | 'CYCLING'
  | 'TRIATHLON'
  | 'SWIMMING'
  | 'OTHER'

export type EventStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface EventItem {
  id: string
  name: string
  sportCategory: string
  location: string
  date: string
  description: string | null
  coverImage: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  eventId: string
  storagePath: string
  code: string
  price: number
  available: boolean
  createdAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  photoId: string
  price: number
  photo: Photo
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  subtotal: number
  total: number
  status: string
  createdAt: string
  demo: boolean
  items: OrderItem[]
}

export interface ApiList<T> {
  data: T[]
  count: number
}

export interface ApiItem<T> {
  data: T
}

export interface ApiErrorBody {
  error: string
  details?: string[]
}

export interface HealthResponse {
  status: string
  database: string
  timestamp: string
}
