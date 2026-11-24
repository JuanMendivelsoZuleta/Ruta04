import "./lib/env";
import { app } from "./app";
import { prisma } from "./lib/prisma";

// Suga expone `SUGA_PUBLIC_TARGET_PORT` con el puerto interno al que enruta el
// tráfico público. Usarlo (junto con PORT como respaldo) evita desajustes de
// puerto entre la app y el proxy del hosting.
const PORT = Number(
  process.env.PORT ?? process.env.SUGA_PUBLIC_TARGET_PORT ?? 4000,
);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Ruta 04 escuchando en 0.0.0.0:${PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
