import { useCallback, useEffect, useRef, useState } from 'react'
import { useCart } from '@/context/cart-context'
import { ApiError, photosApi } from '@/lib/api'

/**
 * Revalida precio y disponibilidad del carrito contra la API.
 * - 404: la foto ya no existe → se marca como no disponible.
 * - Otros errores (red/500): se reporta `validationError` sin alterar la foto.
 */
export function useCartValidation() {
  const { items, replace } = useCart()
  const [validatedKey, setValidatedKey] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const itemsRef = useRef(items)

  const retry = useCallback(() => setRetryKey((key) => key + 1), [])

  const idsKey = items.map((item) => item.photoId).join(',')
  const requestKey = idsKey ? `${idsKey}::${retryKey}` : ''
  const checking = requestKey !== '' && validatedKey !== requestKey

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    if (!requestKey) return

    let active = true
    const current = itemsRef.current
    const key = requestKey

    Promise.all(
      current.map(async (item) => {
        try {
          const { data } = await photosApi.get(item.photoId)
          return {
            item: {
              ...item,
              price: data.price,
              available: data.available,
              storagePath: data.storagePath,
              code: data.code,
            },
            failed: false,
          }
        } catch (error) {
          const notFound = error instanceof ApiError && error.status === 404
          return {
            item: notFound ? { ...item, available: false } : item,
            failed: !notFound,
          }
        }
      }),
    )
      .then((results) => {
        if (!active) return
        replace(results.map((result) => result.item))
        setValidationError(
          results.some((result) => result.failed)
            ? 'No se pudieron verificar precios y disponibilidad. Revisa tu conexión e inténtalo de nuevo.'
            : null,
        )
        setValidatedKey(key)
      })
      .catch(() => {
        if (!active) return
        setValidationError('No se pudieron verificar precios y disponibilidad.')
        setValidatedKey(key)
      })

    return () => {
      active = false
    }
  }, [requestKey, replace])

  return {
    checking,
    unavailable: items.filter((item) => !item.available),
    validationError,
    retry,
  }
}
