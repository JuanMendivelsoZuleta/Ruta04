import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from './cart-context'
import type { CartItem } from './cart-context'

const STORAGE_KEY = 'ruta04.cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.photoId === 'string' &&
    typeof item.code === 'string' &&
    typeof item.price === 'number' &&
    typeof item.storagePath === 'string' &&
    typeof item.eventId === 'string' &&
    typeof item.eventName === 'string' &&
    typeof item.available === 'boolean'
  )
}

function readInitialCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Almacenamiento no disponible (modo privado/cuota): el carrito sigue en memoria.
    }
  }, [items])

  const add = useCallback((item: CartItem) => {
    setItems((current) =>
      current.some((existing) => existing.photoId === item.photoId)
        ? current
        : [...current, item],
    )
  }, [])

  const remove = useCallback((photoId: string) => {
    setItems((current) => current.filter((item) => item.photoId !== photoId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const replace = useCallback((next: CartItem[]) => setItems(next), [])

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    return {
      items,
      count: items.length,
      subtotal,
      add,
      remove,
      clear,
      replace,
      has: (photoId: string) => items.some((item) => item.photoId === photoId),
    }
  }, [items, add, remove, clear, replace])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
