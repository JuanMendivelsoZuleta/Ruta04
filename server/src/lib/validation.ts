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
