import { expect, test } from '@playwright/test'
import { trackConsoleErrors } from './helpers'

test.use({ viewport: { width: 375, height: 667 } })

test('navegación móvil sin desbordamiento horizontal', async ({ page }) => {
  const consoleErrors = trackConsoleErrors(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Tu carrera/ })).toBeVisible()

  await page.getByRole('button', { name: 'Abrir menú' }).click()
  const mobileNav = page.getByRole('navigation', { name: 'Navegación móvil' })
  await expect(mobileNav).toBeVisible()

  await mobileNav.getByRole('link', { name: 'Eventos' }).click()
  await expect(page).toHaveURL(/\/events$/)
  await expect(page.getByRole('heading', { name: 'Eventos deportivos' })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)

  expect(consoleErrors).toEqual([])
})
