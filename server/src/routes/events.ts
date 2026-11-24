import { Router } from "express";
import { parseCreateEvent, parseListQuery, parseUpdateEvent } from "../lib/validation";
import * as eventService from "../services/event.service";

export const eventsRouter = Router();

// Listar con búsqueda (?q=) y filtro por categoría (?sport=)
eventsRouter.get("/", async (req, res) => {
  const filters = parseListQuery(req.query);
  const events = await eventService.listEvents(filters);
  res.json({ data: events, count: events.length });
});

// Consultar por ID
eventsRouter.get("/:id", async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.json({ data: event });
});

// Crear
eventsRouter.post("/", async (req, res) => {
  const input = parseCreateEvent(req.body);
  const event = await eventService.createEvent(input);
  res.status(201).json({ data: event });
});

// Editar (parcial)
eventsRouter.patch("/:id", async (req, res) => {
  const input = parseUpdateEvent(req.body);
  const event = await eventService.updateEvent(req.params.id, input);
  res.json({ data: event });
});

// Eliminar
eventsRouter.delete("/:id", async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(204).send();
});
