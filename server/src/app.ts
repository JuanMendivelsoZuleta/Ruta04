import "./lib/env";
import express from "express";
import { errorHandler, notFoundHandler } from "./lib/http";
import { prisma } from "./lib/prisma";
import { eventsRouter } from "./routes/events";

export const app = express();

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

app.use("/api/events", eventsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
