import { expect, test } from '@playwright/test'
import { trackConsoleErrors } from './helpers'

const email = `e2e.athlete.${Date.now()}@example.com`

test('flujo del deportista: búsqueda, galería, carrito, compra DEMO y biblioteca', async ({
  page,
}) => {
  const consoleErrors = trackConsoleErrors(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Tu carrera/ })).toBeVisible()

  // Exploración con búsqueda y filtro
  await page.goto('/events')
  await page.getByLabel('Buscar').fill('Bogot')
  await page.getByLabel('Deporte').selectOption('RUNNING')

  const eventLink = page.getByRole('link', { name: /Maratón Nocturno DEMO/ })
  await expect(eventLink).toBeVisible()
  await eventLink.click()

  // Galería + lightbox
  await expect(
    page.getByRole('heading', { name: /Maratón Nocturno DEMO/ }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: /Ampliar fotografía DEMO-RUN-01/ })
    .click()

  const lightbox = page.getByRole('dialog')
  await expect(lightbox).toBeVisible()
  await lightbox.getByRole('button', { name: 'Agregar al carrito' }).click()
  await expect(page.getByText(/agregada al carrito/)).toBeVisible()

  // Carrito
  await page.getByRole('link', { name: 'Carrito (1)' }).click()
  await expect(page.getByRole('heading', { name: 'Tu selección' })).toBeVisible()
  await expect(page.getByText('DEMO-RUN-01').first()).toBeVisible()
  await page.getByRole('link', { name: 'Ir a checkout' }).click()

  // Checkout DEMO
  await page.getByLabel('Nombre').fill('Comprador E2E')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByRole('button', { name: 'Completar compra DEMO' }).click()

  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible()
  await expect(page).toHaveURL(/\/orders\/DEMO-/)
  const orderNumber = decodeURIComponent(
    new URL(page.url()).pathname.split('/orders/')[1] ?? '',
  )
  expect(orderNumber).toMatch(/^DEMO-/)

  // Biblioteca por correo
  await page.getByRole('link', { name: 'Ir a mis compras' }).first().click()
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByRole('button', { name: 'Consultar' }).click()

  await expect(page.getByText(/1 pedido encontrado/)).toBeVisible()
  await expect(page.getByText(orderNumber).first()).toBeVisible()

  expect(consoleErrors).toEqual([])
})

test('búsqueda de fotografía por código', async ({ page }) => {
  const consoleErrors = trackConsoleErrors(page)

  await page.goto('/events')
  await page.getByLabel('Código de fotografía').fill('DEMO-RUN-01')
  await expect(page.getByText('DEMO-RUN-01').first()).toBeVisible()

  expect(consoleErrors).toEqual([])
})
