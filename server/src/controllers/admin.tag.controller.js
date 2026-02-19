import { z } from 'zod';
import * as tagService from '../services/tag.service.js';
import logger from '../utils/logger.js';

const TagSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

export async function getAllTags(req, res) {
  try {
    const tags = await tagService.getTagsWithCount();
    res.json({ tags });
  } catch (err) {
    logger.error('admin.tag.controller', `getAllTags error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener tags' });
  }
}

export async function createTag(req, res) {
  try {
    const data = TagSchema.parse(req.body);
    const tag = await tagService.createTag(data);
    res.status(201).json({ tag });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'TAG_ALREADY_EXISTS') {
      return res.status(409).json({ message: 'Ya existe un tag con ese nombre/slug' });
    }
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un tag con ese nombre/slug' });
    }
    logger.error('admin.tag.controller', `createTag error: ${err.message}`);
    res.status(500).json({ message: 'Error al crear tag' });
  }
}

export async function updateTag(req, res) {
  try {
    const data = TagSchema.parse(req.body);
    const tag = await tagService.updateTag(Number(req.params.id), data);
    res.json({ tag });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos invalidos', errors: err.errors });
    }
    if (err.message === 'TAG_NOT_FOUND') {
      return res.status(404).json({ message: 'Tag no encontrado' });
    }
    logger.error('admin.tag.controller', `updateTag error: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar tag' });
  }
}

export async function deleteTag(req, res) {
  try {
    const tag = await tagService.deleteTag(Number(req.params.id));
    res.json({ tag });
  } catch (err) {
    if (err.message === 'TAG_NOT_FOUND') {
      return res.status(404).json({ message: 'Tag no encontrado' });
    }
    if (err.message === 'TAG_HAS_PRODUCTS') {
      return res.status(400).json({
        message: `No se puede desactivar: tiene ${err.productCount} producto(s) asociado(s)`,
      });
    }
    logger.error('admin.tag.controller', `deleteTag error: ${err.message}`);
    res.status(500).json({ message: 'Error al desactivar tag' });
  }
}
