/**
 * Valores de dominio permitidos en el MVP.
 * SQLite no soporta enums, por lo que la restricción se aplica aquí y en las
 * validaciones de la capa de servicios/controladores.
 */

export const SPORT_CATEGORIES = [
  "RUNNING",
  "CYCLING",
  "TRIATHLON",
  "SWIMMING",
  "OTHER",
] as const;
export type SportCategory = (typeof SPORT_CATEGORIES)[number];

export const EVENT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isSportCategory(value: unknown): value is SportCategory {
  return (
    typeof value === "string" &&
    (SPORT_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isEventStatus(value: unknown): value is EventStatus {
  return (
    typeof value === "string" &&
    (EVENT_STATUSES as readonly string[]).includes(value)
  );
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}
