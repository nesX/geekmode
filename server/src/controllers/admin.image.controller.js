import { z } from 'zod';
import * as imageService from '../services/image.service.js';
import logger from '../utils/logger.js';

const ReorderSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.number().int().positive(),
        display_order: z.number().int().min(0),
      })
    )
    .min(1),
});

export async function getImages(req, res, next) {
  try {
    const images = await imageService.getProductImages(req.params.productId);
    res.json({ images });
  } catch (err) {
    logger.error('admin.image.controller', `getImages error: ${err.message}`);
    next(err);
  }
}

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
    const image = await imageService.uploadImage(
      req.params.productId,
      req.file,
      req.body.alt_text || ''
    );
    res.status(201).json({ image });
  } catch (err) {
    if (err.message === 'MAX_IMAGES') {
      return res.status(400).json({ error: 'Límite de 8 imágenes alcanzado' });
    }
    if (err.message === 'INVALID_TYPE') {
      return res.status(400).json({ error: 'Solo se permiten JPG, PNG o WebP' });
    }
    logger.error('admin.image.controller', `uploadImage error: ${err.message}`);
    next(err);
  }
}

export async function setPrimary(req, res, next) {
  try {
    const image = await imageService.setPrimaryImage(
      req.params.imageId,
      req.params.productId
    );
    res.json({ image });
  } catch (err) {
    if (err.message === 'IMAGE_NOT_FOUND') {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    logger.error('admin.image.controller', `setPrimary error: ${err.message}`);
    next(err);
  }
}

export async function reorderImages(req, res, next) {
  try {
    const parsed = ReorderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    await imageService.reorderImages(parsed.data.images);
    res.json({ ok: true });
  } catch (err) {
    logger.error('admin.image.controller', `reorderImages error: ${err.message}`);
    next(err);
  }
}

export async function deleteImage(req, res, next) {
  try {
    await imageService.deleteImage(req.params.imageId);
    res.json({ ok: true });
  } catch (err) {
    if (err.message === 'IMAGE_NOT_FOUND') {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    logger.error('admin.image.controller', `deleteImage error: ${err.message}`);
    next(err);
  }
}
