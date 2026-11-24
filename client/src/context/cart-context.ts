import { createContext, useContext } from 'react'

export type CartItem = {
  photoId: string
  code: string
  price: number
  storagePath: string
  eventId: string
  eventName: string
  available: boolean
}

export type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: CartItem) => void
  remove: (photoId: string) => void
  clear: () => void
  replace: (items: CartItem[]) => void
  has: (photoId: string) => boolean
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return context
}
