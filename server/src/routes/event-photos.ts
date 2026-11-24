import { Router } from "express";
import { uploadPhotos } from "../lib/storage";
import { parsePhotoUploadFields } from "../lib/validation";
import * as photoService from "../services/photos.service";

export const eventPhotosRouter = Router();

// Galería del evento
eventPhotosRouter.get("/:eventId/photos", async (req, res) => {
  const eventId = String(req.params.eventId);
  const photos = await photoService.listPhotosByEvent(eventId);
  res.json({ data: photos, count: photos.length });
});

// Subir una o varias fotografías y asociarlas al evento.
// multer mantiene los archivos en memoria y el servicio los sube a Cloudinary;
// si algo falla, el propio servicio limpia los assets ya subidos.
eventPhotosRouter.post("/:eventId/photos", uploadPhotos, async (req, res) => {
  const eventId = String(req.params.eventId);
  const files = Array.isArray(req.files) ? req.files : [];

  const { price, code } = parsePhotoUploadFields(req.body);
  const photos = await photoService.createPhotos(eventId, files, price, code);
  res.status(201).json({ data: photos, count: photos.length });
});
