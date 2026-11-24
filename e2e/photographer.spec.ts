import { expect, test } from '@playwright/test'
import { trackConsoleErrors } from './helpers'

const stamp = Date.now()
const eventName = `E2E Evento ${stamp}`
const updatedName = `${eventName} editado`

test('flujo del fotógrafo: evento y fotografías con persistencia real', async ({ page }) => {
  const consoleErrors = trackConsoleErrors(page)

  await page.goto('/photographer')
  await expect(page.getByRole('heading', { name: 'Panel del fotógrafo' })).toBeVisible()
  await expect(page.getByText(/Modo fotógrafo · DEMO/)).toBeVisible()

  // Crear evento
  await page.getByRole('link', { name: 'Crear evento' }).first().click()
  await page.getByLabel('Nombre del evento').fill(eventName)
  await page.getByLabel('Categoría deportiva').selectOption('CYCLING')
  await page.getByLabel('Ubicación').fill('Ciudad E2E')
  await page.getByLabel('Fecha y hora').fill('2027-07-01T10:00')
  await page.getByLabel('Descripción (opcional)').fill('Evento temporal E2E')
  await page.getByRole('button', { name: 'Crear evento' }).click()

  await expect(page.getByText(eventName)).toBeVisible()

  // Ir a las fotos del evento
  const row = page.locator('li', { hasText: eventName })
  await row.getByRole('link', { name: 'Fotografías' }).click()
  await expect(page.getByRole('heading', { name: 'Fotografías' })).toBeVisible()

  // Subir fotografía (evento preseleccionado por query param)
  await page.getByRole('link', { name: 'Subir fotografías' }).click()
  await expect(page.getByLabel('Evento')).not.toHaveValue('')
  await page.getByLabel('Precio por fotografía (COP)').fill('17500')
  await page.locator('input[type="file"]').setInputFiles('e2e/fixtures/photo.png')
  await expect(page.getByText('1 archivo seleccionado')).toBeVisible()
  await page.getByRole('button', { name: 'Subir fotografías' }).click()

  await expect(page).toHaveURL(/\/photographer\/photos\?eventId=/)
  await expect(page.getByText(/17\.500/).first()).toBeVisible()
  await expect(page.getByText('Disponible', { exact: true }).first()).toBeVisible()

  // Editar precio y disponibilidad
  await page.getByRole('button', { name: 'Editar' }).click()
  const editDialog = page.getByRole('dialog')
  await expect(editDialog).toBeVisible()
  await editDialog.getByLabel('Precio (COP)').fill('25000')
  await editDialog.getByLabel('Disponibilidad').selectOption('false')
  await editDialog.getByRole('button', { name: 'Guardar' }).click()
  await expect(
    page.getByText('No disponible', { exact: true }).first(),
  ).toBeVisible()
  await expect(page.getByText(/25\.000/).first()).toBeVisible()

  // Eliminar fotografía
  await page.getByRole('button', { name: 'Eliminar' }).click()
  const deletePhotoDialog = page.getByRole('dialog')
  await deletePhotoDialog.getByRole('button', { name: 'Eliminar fotografía' }).click()
  await expect(page.getByText('Sin resultados')).toBeVisible()

  // Editar evento
  await page.goto('/photographer/events')
  const rowToEdit = page.locator('li', { hasText: eventName })
  await rowToEdit.getByRole('link', { name: 'Editar' }).click()
  await page.getByLabel('Nombre del evento').fill(updatedName)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText(updatedName)).toBeVisible()

  // Eliminar evento
  const rowToDelete = page.locator('li', { hasText: updatedName })
  await rowToDelete.getByRole('button', { name: 'Eliminar' }).click()
  const deleteEventDialog = page.getByRole('dialog')
  await deleteEventDialog.getByRole('button', { name: 'Eliminar evento' }).click()
  await expect(page.getByText(updatedName)).toHaveCount(0)

  expect(consoleErrors).toEqual([])
})
