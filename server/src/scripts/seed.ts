import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { UPLOAD_DIR } from "../lib/storage";

/**
 * Carga idempotente de datos DEMO.
 *
 * - 4 eventos ficticios (claramente identificados como DEMO).
 * - 4 categorías deportivas y 24 fotografías (6 por evento).
 * - Intenta descargar fotografías deportivas reales desde Wikimedia Commons
 *   (licencias libres) y las guarda en server/uploads. Si la descarga falla
 *   (sin red, 404, formato inválido), genera un placeholder SVG local marcado
 *   como DEMO. En ningún caso se presentan como fotos de eventos reales.
 * - Los IDs son deterministas: re-ejecutar el seed no duplica registros.
 */

type SportCategory = "RUNNING" | "CYCLING" | "TRIATHLON" | "SWIMMING";

type DemoEvent = {
  id: string;
  slug: string;
  name: string;
  sportCategory: SportCategory;
  location: string;
  date: string;
  description: string;
  searchTerm: string;
  prices: number[];
};

const PHOTOS_PER_EVENT = 6;

const DEMO_EVENTS: DemoEvent[] = [
  {
    id: "demo-event-running",
    slug: "run",
    name: "Maratón Nocturno DEMO - Bogotá",
    sportCategory: "RUNNING",
    location: "Bogotá, Cundinamarca",
    date: "2027-02-14T22:00:00.000Z",
    description:
      "Evento ficticio de demostración (running, maratón 42K). Datos e imágenes ilustrativos para el MVP; no corresponde a un evento real ni a resultados reales.",
    searchTerm: "marathon running",
    prices: [8000, 12000, 15000, 18000, 22000, 25000],
  },
  {
    id: "demo-event-cycling",
    slug: "cyc",
    name: "Gran Fondo Ciclismo DEMO - Medellín",
    sportCategory: "CYCLING",
    location: "Medellín, Antioquia",
    date: "2027-03-21T07:00:00.000Z",
    description:
      "Evento ficticio de demostración (ciclismo de ruta). Datos e imágenes ilustrativos para el MVP; no corresponde a un evento real ni a resultados reales.",
    searchTerm: "road cycling race",
    prices: [10000, 14000, 16000, 20000, 24000, 28000],
  },
  {
    id: "demo-event-triathlon",
    slug: "tri",
    name: "Triatlón Sprint DEMO - Cartagena",
    sportCategory: "TRIATHLON",
    location: "Cartagena, Bolívar",
    date: "2027-04-18T06:00:00.000Z",
    description:
      "Evento ficticio de demostración (triatlón: natación, ciclismo y carrera). Datos e imágenes ilustrativos para el MVP; no corresponde a un evento real ni a resultados reales.",
    searchTerm: "triathlon competition",
    prices: [12000, 15000, 19000, 23000, 27000, 32000],
  },
  {
    id: "demo-event-swimming",
    slug: "swi",
    name: "Copa de Natación DEMO - Cali",
    sportCategory: "SWIMMING",
    location: "Cali, Valle del Cauca",
    date: "2027-05-09T09:00:00.000Z",
    description:
      "Evento ficticio de demostración (natación de competencia). Datos e imágenes ilustrativos para el MVP; no corresponde a un evento real ni a resultados reales.",
    searchTerm: "swimming competition",
    prices: [9000, 11000, 13000, 17000, 21000, 26000],
  },
];

const USER_AGENT = "Ruta04Demo/1.0 (MVP academico; imagenes de demostracion)";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

const PALETTES: Record<SportCategory, [string, string]> = {
  RUNNING: ["#0b1220", "#a3e635"],
  CYCLING: ["#0f172a", "#22d3ee"],
  TRIATHLON: ["#111827", "#f59e0b"],
  SWIMMING: ["#082f49", "#38bdf8"],
};

type CandidateImage = { mime?: string; thumburl?: string; url?: string };

type PhotoSpec = {
  event: DemoEvent;
  index: number;
  id: string;
  code: string;
  baseName: string;
  price: number;
  available: boolean;
  url: string | null;
};

type ResolvedPhoto = PhotoSpec & {
  filename: string;
  source: "wikimedia" | "local" | "fallback";
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function photoId(slug: string, index: number): string {
  return `demo-photo-${slug}-${pad(index + 1)}`;
}

function photoCode(slug: string, index: number): string {
  return `DEMO-${slug.toUpperCase()}-${pad(index + 1)}`;
}

function escapeXml(value: string): string {
  const entities: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  };
  return value.replace(/[<>&'"]/g, (char) => entities[char] ?? char);
}

function findExistingImage(baseName: string): string | null {
  for (const extension of IMAGE_EXTENSIONS) {
    const filename = `${baseName}${extension}`;
    if (existsSync(path.join(UPLOAD_DIR, filename))) {
      return filename;
    }
  }
  return null;
}

/** Obtiene URLs de imágenes deportivas desde la API pública de Wikimedia. */
async function fetchCandidateUrls(searchTerm: string, limit: number): Promise<string[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `filetype:bitmap ${searchTerm}`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", String(limit));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime");
  url.searchParams.set("iiurlwidth", "1200");
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as {
      query?: { pages?: Record<string, { imageinfo?: CandidateImage[] }> };
    };
    const pages = data.query?.pages ?? {};
    const urls: string[] = [];
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      if (!info || !info.mime?.startsWith("image/")) {
        continue;
      }
      const candidate = info.thumburl ?? info.url;
      if (candidate) {
        urls.push(candidate);
      }
    }
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

/** Descarga una imagen y la guarda localmente; null si algo falla. */
async function downloadImage(url: string, baseName: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return null;
    }
    const extension = contentType.includes("png")
      ? ".png"
      : contentType.includes("webp")
        ? ".webp"
        : ".jpg";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1024) {
      return null;
    }
    const filename = `${baseName}${extension}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    return filename;
  } catch {
    return null;
  }
}

function fallbackSvg(event: DemoEvent, index: number, code: string): string {
  const [background, accent] = PALETTES[event.sportCategory];
  const title = escapeXml(`${event.sportCategory} · DEMO`);
  const subtitle = escapeXml(event.name);
  const label = escapeXml(`Fotografía ${code}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="Placeholder deportivo de demostración">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="${190 + index * 130}" cy="${170 + (index % 3) * 130}" r="${90 + index * 12}" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="${980 - index * 40}" cy="${560 - (index % 2) * 80}" r="${60 + index * 10}" fill="#ffffff" fill-opacity="0.06"/>
  <text x="80" y="350" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700">${title}</text>
  <text x="80" y="430" fill="#ffffff" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" font-size="36">${subtitle}</text>
  <text x="80" y="505" fill="#ffffff" fill-opacity="0.78" font-family="Arial, Helvetica, sans-serif" font-size="28">${label}</text>
  <text x="80" y="720" fill="#ffffff" fill-opacity="0.62" font-family="Arial, Helvetica, sans-serif" font-size="24">Imagen de demostración · no es una fotografía de un evento real</text>
</svg>`;
}

async function writeFallback(
  event: DemoEvent,
  index: number,
  code: string,
  baseName: string,
): Promise<string> {
  const filename = `${baseName}.svg`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), fallbackSvg(event, index, code), "utf8");
  return filename;
}

function countSources(photos: ResolvedPhoto[]): Record<ResolvedPhoto["source"], number> {
  return photos.reduce(
    (acc, photo) => {
      acc[photo.source] += 1;
      return acc;
    },
    { wikimedia: 0, local: 0, fallback: 0 },
  );
}

async function main(): Promise<void> {
  console.log("== Carga de datos DEMO (Ruta 04) ==\n");

  // 1. Candidatas por evento (se intenta una búsqueda por categoría)
  const candidateLists = await Promise.all(
    DEMO_EVENTS.map(async (event) => {
      const urls = await fetchCandidateUrls(event.searchTerm, 12);
      console.log(`  ${event.sportCategory}: ${urls.length} imágenes candidatas`);
      return urls;
    }),
  );

  // 2. Asignar una URL distinta a cada foto (evita repetir imágenes)
  const usedUrls = new Set<string>();
  const specs: PhotoSpec[] = [];
  DEMO_EVENTS.forEach((event, eventIndex) => {
    const candidates = candidateLists[eventIndex].filter((url) => !usedUrls.has(url));
    for (let index = 0; index < PHOTOS_PER_EVENT; index += 1) {
      let url: string | null = null;
      while (candidates.length > 0 && url === null) {
        const candidate = candidates.shift() ?? null;
        if (candidate && !usedUrls.has(candidate)) {
          url = candidate;
          usedUrls.add(candidate);
        }
      }
      specs.push({
        event,
        index,
        id: photoId(event.slug, index),
        code: photoCode(event.slug, index),
        baseName: `demo-${event.slug}-${pad(index + 1)}`,
        price: event.prices[index],
        available: index < PHOTOS_PER_EVENT - 1,
        url,
      });
    }
  });

  // 3. Resolver archivos: reutilizar local, descargar o generar fallback
  const resolved = await Promise.all(
    specs.map(async (spec): Promise<ResolvedPhoto> => {
      const existing = findExistingImage(spec.baseName);
      if (existing) {
        return { ...spec, filename: existing, source: "local" };
      }
      if (spec.url) {
        const downloaded = await downloadImage(spec.url, spec.baseName);
        if (downloaded) {
          return { ...spec, filename: downloaded, source: "wikimedia" };
        }
      }
      const fallback = await writeFallback(spec.event, spec.index, spec.code, spec.baseName);
      return { ...spec, filename: fallback, source: "fallback" };
    }),
  );

  // 4. Persistir eventos y fotografías (upsert idempotente)
  for (const event of DEMO_EVENTS) {
    const eventPhotos = resolved.filter((photo) => photo.event.id === event.id);
    const coverImage = eventPhotos[0] ? `/uploads/${eventPhotos[0].filename}` : null;
    const eventData = {
      name: event.name,
      sportCategory: event.sportCategory,
      location: event.location,
      date: new Date(event.date),
      description: event.description,
      coverImage,
      status: "ACTIVE",
    };

    await prisma.event.upsert({
      where: { id: event.id },
      update: eventData,
      create: { id: event.id, ...eventData },
    });

    for (const photo of eventPhotos) {
      const photoData = {
        eventId: event.id,
        storagePath: `/uploads/${photo.filename}`,
        code: photo.code,
        price: photo.price,
        available: photo.available,
      };
      await prisma.photo.upsert({
        where: { id: photo.id },
        update: photoData,
        create: { id: photo.id, ...photoData },
      });
    }

    console.log(`  Evento "${event.name}" listo (${eventPhotos.length} fotos)`);
  }

  const sources = countSources(resolved);
  const [eventCount, photoCount] = await Promise.all([
    prisma.event.count({ where: { id: { startsWith: "demo-event-" } } }),
    prisma.photo.count({ where: { id: { startsWith: "demo-photo-" } } }),
  ]);

  console.log(
    `\nDEMO listo: ${eventCount} eventos, ${photoCount} fotografías, ${DEMO_EVENTS.length} categorías.`,
  );
  console.log(
    `Imágenes: ${sources.wikimedia} descargadas de Wikimedia Commons, ${sources.local} reutilizadas, ${sources.fallback} placeholders SVG locales.`,
  );
  console.log("Las imágenes son ilustrativas de demostración; no corresponden a los eventos ficticios.");
}

main()
  .catch((error: unknown) => {
    console.error("Error cargando datos DEMO:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
