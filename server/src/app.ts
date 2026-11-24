import "./lib/env";
import express from "express";
import { errorHandler, notFoundHandler } from "./lib/http";
import { prisma } from "./lib/prisma";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX } from "./lib/storage";
import { eventPhotosRouter } from "./routes/event-photos";
import { eventsRouter } from "./routes/events";
import { ordersRouter } from "./routes/orders";
import { photosRouter } from "./routes/photos";

export const app = express();

app.use(express.json());

// Sirve las imágenes almacenadas localmente en server/uploads
app.use(UPLOAD_URL_PREFIX, express.static(UPLOAD_DIR));

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

app.use(notFoundHandler);
app.use(errorHandler);
