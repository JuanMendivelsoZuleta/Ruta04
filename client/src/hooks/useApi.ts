import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from '@/lib/api'

type UseApiState<T> = {
  data: T | null
  error: string | null
  requestKey: string | null
}

/**
 * Hook de lectura para endpoints GET.
 * Deriva `loading` en render comparando la petición actual con la última
 * resuelta, evitando setState síncrono dentro del efecto.
 */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    requestKey: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  const requestKey = path ? `${path}::${reloadKey}` : null

  useEffect(() => {
    if (!path || !requestKey) {
      return
    }

    let active = true
    const key = requestKey

    api
      .get<T>(path)
      .then((data) => {
        if (active) setState({ data, error: null, requestKey: key })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message =
          error instanceof ApiError ? error.message : 'Ocurrió un error inesperado'
        setState({ data: null, error: message, requestKey: key })
      })

    return () => {
      active = false
    }
  }, [path, requestKey])

  if (!path) {
    return { data: null, loading: false, error: null, reload }
  }

  const loading = state.requestKey !== requestKey
  return {
    data: loading ? null : state.data,
    loading,
    error: loading ? null : state.error,
    reload,
  }
}
