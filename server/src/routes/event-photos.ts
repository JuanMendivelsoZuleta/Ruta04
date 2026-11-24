import { Router } from "express";
import { removeStoredFiles, toStoragePath, uploadPhotos } from "../lib/storage";
import { parsePhotoUploadFields } from "../lib/validation";
import * as photoService from "../services/photos.service";

export const eventPhotosRouter = Router();

// Galería del evento
eventPhotosRouter.get("/:eventId/photos", async (req, res) => {
  const eventId = String(req.params.eventId);
  const photos = await photoService.listPhotosByEvent(eventId);
  res.json({ data: photos, count: photos.length });
});

// Subir una o varias fotografías y asociarlas al evento
eventPhotosRouter.post("/:eventId/photos", uploadPhotos, async (req, res) => {
  const eventId = String(req.params.eventId);
  const files = Array.isArray(req.files) ? req.files : [];

  try {
    const { price, code } = parsePhotoUploadFields(req.body);
    const photos = await photoService.createPhotos(eventId, files, price, code);
    res.status(201).json({ data: photos, count: photos.length });
  } catch (error) {
    // Si la validación o la inserción fallan, se eliminan los archivos ya
    // escritos por multer para no dejar huérfanos.
    await removeStoredFiles(files.map((file) => toStoragePath(file.filename)));
    throw error;
  }
});
