import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from './api'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cliente API', () => {
  it('parsea respuestas exitosas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [1, 2], count: 2 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api.get<{ count: number }>('/api/events')

    expect(result.count).toBe(2)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('mapea errores del backend con status y details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: 'Datos inválidos', details: ['name'] }, 400),
      ),
    )

    await expect(api.get('/api/events')).rejects.toBeInstanceOf(ApiError)
    await expect(api.get('/api/events')).rejects.toMatchObject({
      status: 400,
      message: 'Datos inválidos',
      details: ['name'],
    })
  })

  it('mapea fallos de red a status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    await expect(api.get('/api/events')).rejects.toMatchObject({ status: 0 })
  })

  it('no fuerza Content-Type JSON al subir FormData', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [], count: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await api.upload('/api/events/event-1/photos', new FormData())

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    const headers = init.headers as Headers
    expect(headers.get('Content-Type')).toBeNull()
  })
})
