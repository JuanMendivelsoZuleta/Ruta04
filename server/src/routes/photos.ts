import { Router } from "express";
import { parsePhotoListQuery, parsePhotoUpdate } from "../lib/validation";
import * as photoService from "../services/photos.service";

export const photosRouter = Router();

// Listar / filtrar por evento (?eventId=) y disponibilidad (?available=)
photosRouter.get("/", async (req, res) => {
  const filters = parsePhotoListQuery(req.query);
  const photos = await photoService.listPhotos(filters);
  res.json({ data: photos, count: photos.length });
});

// Consultar por ID
photosRouter.get("/:id", async (req, res) => {
  const photo = await photoService.getPhotoById(req.params.id);
  res.json({ data: photo });
});

// Editar precio y disponibilidad
photosRouter.patch("/:id", async (req, res) => {
  const input = parsePhotoUpdate(req.body);
  const photo = await photoService.updatePhoto(req.params.id, input);
  res.json({ data: photo });
});

// Eliminar (registro + archivo físico)
photosRouter.delete("/:id", async (req, res) => {
  await photoService.deletePhoto(req.params.id);
  res.status(204).send();
});
