import {
  EVENT_STATUSES,
  SPORT_CATEGORIES,
  isEventStatus,
  isSportCategory,
} from "./domain";
import { AppError } from "./http";

/** Datos validados para crear un evento (coinciden con el modelo Prisma). */
export type EventCreateInput = {
  name: string;
  sportCategory: string;
  location: string;
  date: Date;
  description: string | null;
  coverImage: string | null;
  status: string;
};

/** Datos validados para actualizar un evento (parcial). */
export type EventUpdateInput = Partial<EventCreateInput>;

/** Filtros del listado de eventos. */
export type EventListQuery = {
  q?: string;
  sport?: string;
};

const NAME_RULES = { min: 2, max: 120 };
const LOCATION_RULES = { min: 2, max: 120 };
const DESCRIPTION_MAX = 1000;
const COVER_IMAGE_MAX = 500;

function badRequest(details: string[]): AppError {
  return new AppError(400, "Datos inválidos", details);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw badRequest(["El cuerpo debe ser un objeto JSON"]);
  }
  return body;
}

function readRequiredString(
  value: unknown,
  field: string,
  rules: { min: number; max: number },
): string {
  if (value === undefined || value === null) {
    throw badRequest([`${field} es obligatorio`]);
  }
  if (typeof value !== "string") {
    throw badRequest([`${field} debe ser texto`]);
  }
  const trimmed = value.trim();
  if (trimmed.length < rules.min) {
    throw badRequest([`${field} debe tener al menos ${rules.min} caracteres`]);
  }
  if (trimmed.length > rules.max) {
    throw badRequest([`${field} no puede superar ${rules.max} caracteres`]);
  }
  return trimmed;
}

function readNullableString(value: unknown, field: string, max: number): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw badRequest([`${field} debe ser texto o null`]);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > max) {
    throw badRequest([`${field} no puede superar ${max} caracteres`]);
  }
  return trimmed;
}

function readDate(value: unknown, field: string): Date {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest([`${field} debe ser una fecha ISO 8601`]);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest([`${field} no es una fecha válida`]);
  }
  return date;
}

function readSportCategory(value: unknown): string {
  if (typeof value !== "string" || !isSportCategory(value)) {
    throw badRequest([
      `sportCategory debe ser uno de: ${SPORT_CATEGORIES.join(", ")}`,
    ]);
  }
  return value;
}

function readEventStatus(value: unknown): string {
  if (typeof value !== "string" || !isEventStatus(value)) {
    throw badRequest([`status debe ser uno de: ${EVENT_STATUSES.join(", ")}`]);
  }
  return value;
}

/** Valida y normaliza el cuerpo para crear un evento. */
export function parseCreateEvent(body: unknown): EventCreateInput {
  const data = requireRecord(body);
  return {
    name: readRequiredString(data.name, "name", NAME_RULES),
    sportCategory: readSportCategory(data.sportCategory),
    location: readRequiredString(data.location, "location", LOCATION_RULES),
    date: readDate(data.date, "date"),
    description:
      data.description === undefined
        ? null
        : readNullableString(data.description, "description", DESCRIPTION_MAX),
    coverImage:
      data.coverImage === undefined
        ? null
        : readNullableString(data.coverImage, "coverImage", COVER_IMAGE_MAX),
    status: data.status === undefined ? "ACTIVE" : readEventStatus(data.status),
  };
}

/** Valida y normaliza el cuerpo para actualizar un evento (parcial). */
export function parseUpdateEvent(body: unknown): EventUpdateInput {
  const data = requireRecord(body);
  const input: EventUpdateInput = {};

  if ("name" in data) {
    input.name = readRequiredString(data.name, "name", NAME_RULES);
  }
  if ("sportCategory" in data) {
    input.sportCategory = readSportCategory(data.sportCategory);
  }
  if ("location" in data) {
    input.location = readRequiredString(data.location, "location", LOCATION_RULES);
  }
  if ("date" in data) {
    input.date = readDate(data.date, "date");
  }
  if ("description" in data) {
    input.description = readNullableString(data.description, "description", DESCRIPTION_MAX);
  }
  if ("coverImage" in data) {
    input.coverImage = readNullableString(data.coverImage, "coverImage", COVER_IMAGE_MAX);
  }
  if ("status" in data) {
    input.status = readEventStatus(data.status);
  }

  if (Object.keys(input).length === 0) {
    throw badRequest(["Debe enviar al menos un campo para actualizar"]);
  }
  return input;
}

/** Valida y normaliza los query params del listado (búsqueda y filtro). */
export function parseListQuery(query: Record<string, unknown>): EventListQuery {
  const filters: EventListQuery = {};

  if (typeof query.q === "string" && query.q.trim() !== "") {
    filters.q = query.q.trim();
  }

  if (typeof query.sport === "string" && query.sport.trim() !== "") {
    const sport = query.sport.trim();
    if (!isSportCategory(sport)) {
      throw badRequest([`sport debe ser uno de: ${SPORT_CATEGORIES.join(", ")}`]);
    }
    filters.sport = sport;
  }

  return filters;
}

/* ------------------------------------------------------------------------- */
/* Fotografías                                                                */
/* ------------------------------------------------------------------------- */

/** Campos de texto recibidos junto a la subida multipart. */
export type PhotoUploadFields = {
  price: number;
  code?: string;
};

/** Datos validados para actualizar una fotografía. */
export type PhotoUpdateInput = {
  price?: number;
  available?: boolean;
};

/** Filtros del listado de fotografías. */
export type PhotoListQuery = {
  eventId?: string;
  available?: boolean;
  code?: string;
};

const PHOTO_CODE_PATTERN = /^[A-Z0-9_-]{3,40}$/;

function readInteger(
  value: unknown,
  field: string,
  options: { required: boolean },
): number | undefined {
  if (value === undefined || value === null || value === "") {
    if (options.required) {
      throw badRequest([`${field} es obligatorio`]);
    }
    return undefined;
  }
  if (typeof value !== "string" && typeof value !== "number") {
    throw badRequest([`${field} debe ser un número entero`]);
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw badRequest([`${field} debe ser un entero mayor o igual a 0`]);
  }
  return parsed;
}

function readPhotoCode(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw badRequest(["code debe ser texto"]);
  }
  const normalized = value.trim().toUpperCase();
  if (!PHOTO_CODE_PATTERN.test(normalized)) {
    throw badRequest([
      "code debe tener entre 3 y 40 caracteres alfanuméricos, guion o guion bajo",
    ]);
  }
  return normalized;
}

function readBoolean(value: unknown, field: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw badRequest([`${field} debe ser true o false`]);
}

/** Valida los campos de texto de la subida de fotografías. */
export function parsePhotoUploadFields(body: unknown): PhotoUploadFields {
  const data = requireRecord(body);
  const price = readInteger(data.price, "price", { required: true });
  if (price === undefined) {
    throw badRequest(["price es obligatorio"]);
  }
  const code = readPhotoCode(data.code);
  return code === undefined ? { price } : { price, code };
}

/** Valida la edición parcial de precio y disponibilidad. */
export function parsePhotoUpdate(body: unknown): PhotoUpdateInput {
  const data = requireRecord(body);
  const input: PhotoUpdateInput = {};

  if ("price" in data) {
    const price = readInteger(data.price, "price", { required: true });
    if (price === undefined) {
      throw badRequest(["price es obligatorio"]);
    }
    input.price = price;
  }

  if ("available" in data) {
    input.available = readBoolean(data.available, "available");
  }

  if (Object.keys(input).length === 0) {
    throw badRequest(["Debe enviar al menos un campo para actualizar (price o available)"]);
  }
  return input;
}

/** Valida los filtros del listado de fotografías. */
export function parsePhotoListQuery(query: Record<string, unknown>): PhotoListQuery {
  const filters: PhotoListQuery = {};

  if (typeof query.eventId === "string" && query.eventId.trim() !== "") {
    filters.eventId = query.eventId.trim();
  }

  if (typeof query.available === "string" && query.available !== "") {
    filters.available = readBoolean(query.available, "available");
  }

  if (typeof query.code === "string" && query.code.trim() !== "") {
    filters.code = query.code.trim();
  }

  return filters;
}

/* ------------------------------------------------------------------------- */
/* Pedidos DEMO                                                              */
/* ------------------------------------------------------------------------- */

/** Datos validados para crear un pedido DEMO. */
export type OrderCreateInput = {
  customerName: string;
  customerEmail: string;
  photoIds: string[];
};

/** Filtro de consulta de pedidos por correo. */
export type OrderListQuery = {
  email: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ORDER_PHOTOS = 50;

function readEmail(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest([`${field} es obligatorio`]);
  }
  const normalized = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw badRequest([`${field} no es un correo válido`]);
  }
  return normalized;
}

/** Valida los datos del comprador y los IDs de fotografía seleccionados. */
export function parseCreateOrder(body: unknown): OrderCreateInput {
  const data = requireRecord(body);
  const customerName = readRequiredString(data.customerName, "customerName", {
    min: 2,
    max: 120,
  });
  const customerEmail = readEmail(data.customerEmail, "customerEmail");

  const rawIds = data.photoIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    throw badRequest([
      "photoIds debe ser un arreglo con al menos una fotografía",
    ]);
  }
  if (rawIds.length > MAX_ORDER_PHOTOS) {
    throw badRequest([
      `No se pueden comprar más de ${MAX_ORDER_PHOTOS} fotografías por pedido`,
    ]);
  }

  const ids: string[] = [];
  for (const rawId of rawIds) {
    if (typeof rawId !== "string" || rawId.trim() === "") {
      throw badRequest(["Cada elemento de photoIds debe ser un ID válido"]);
    }
    ids.push(rawId.trim());
  }

  // Deduplicación defensiva: la misma foto no se cobra ni se guarda dos veces.
  const photoIds = [...new Set(ids)];
  return { customerName, customerEmail, photoIds };
}

/** Valida el correo requerido para consultar pedidos. */
export function parseOrderListQuery(query: Record<string, unknown>): OrderListQuery {
  return { email: readEmail(query.email, "email") };
}
