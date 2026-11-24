import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Carga el archivo .env local (si existe) antes de instanciar Prisma.
 * Se evita la dependencia de `dotenv` usando la API nativa de Node.
 */
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}
