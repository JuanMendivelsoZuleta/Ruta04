import "./lib/env";
import { existsSync } from "node:fs";
import path from "node:path";
import express from "express";
import { errorHandler, notFoundHandler } from "./lib/http";
import { prisma } from "./lib/prisma";
import { eventPhotosRouter } from "./routes/event-photos";
import { eventsRouter } from "./routes/events";
import { ordersRouter } from "./routes/orders";
import { photosRouter } from "./routes/photos";

export const app = express();

// CORS: en producción el frontend (Vercel) y la API (Render) viven en dominios
// distintos. Solo se permiten los orígenes indicados en CORS_ORIGIN
// (lista separada por comas). Si la variable está vacía, no se envía cabecera
// CORS y solo funcionará el mismo origen (útil en desarrollo local).
const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/events", eventPhotosRouter);
app.use("/api/events", eventsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/orders", ordersRouter);

// Frontend compilado (producción): sirve client/dist y resuelve rutas SPA.
const CLIENT_DIST = path.resolve(__dirname, "../../client/dist");
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    if (!req.headers.accept?.includes("text/html")) {
      next();
      return;
    }
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
