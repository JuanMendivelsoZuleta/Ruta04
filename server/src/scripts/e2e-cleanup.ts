import { prisma } from '../lib/prisma'
import { removeStoredFiles } from '../lib/storage'

/**
 * Limpieza de datos generados por las pruebas E2E.
 * - Pedidos cuyo correo empieza por "e2e."
 * - Eventos cuyo nombre empieza por "E2E " (y sus archivos)
 */
async function main(): Promise<void> {
  const orders = await prisma.order.deleteMany({
    where: { customerEmail: { startsWith: 'e2e.' } },
  })

  const events = await prisma.event.findMany({
    where: { name: { startsWith: 'E2E ' } },
    select: {
      id: true,
      photos: { select: { storagePath: true } },
    },
  })

  let removedEvents = 0
  for (const event of events) {
    try {
      await prisma.event.delete({ where: { id: event.id } })
      await removeStoredFiles(event.photos.map((photo) => photo.storagePath))
      removedEvents += 1
    } catch {
      // Si el evento tiene dependencias no E2E, no se fuerza el borrado.
    }
  }

  console.log(
    `[e2e-cleanup] pedidos eliminados=${orders.count} eventos E2E eliminados=${removedEvents}`,
  )
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
