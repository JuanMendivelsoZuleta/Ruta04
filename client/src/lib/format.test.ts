import { describe, expect, it } from 'vitest'
import { formatCategory, formatDate, formatPrice } from './format'

describe('format', () => {
  it('formatea precios en COP sin decimales', () => {
    expect(formatPrice(15000)).toContain('15.000')
    expect(formatPrice(0)).toContain('0')
  })

  it('traduce las categorías deportivas', () => {
    expect(formatCategory('RUNNING')).toBe('Running')
    expect(formatCategory('SWIMMING')).toBe('Natación')
    expect(formatCategory('DESCONOCIDO')).toBe('DESCONOCIDO')
  })

  it('formatea fechas ISO', () => {
    const formatted = formatDate('2026-05-10T12:00:00.000Z')
    expect(formatted).not.toBe('2026-05-10T12:00:00.000Z')
    expect(formatted.length).toBeGreaterThan(0)
  })
})
