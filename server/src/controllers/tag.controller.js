import * as tagService from '../services/tag.service.js';
import logger from '../utils/logger.js';

export async function getTags(req, res) {
  try {
    const tags = await tagService.getTagsWithCount();
    res.json({ tags });
  } catch (err) {
    logger.error('tag.controller', `getTags error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener tags' });
  }
}

export async function getTagBySlug(req, res) {
  try {
    const { tag, products } = await tagService.getProductsByTag(req.params.slug);
    res.json({ tag, products });
  } catch (err) {
    if (err.message === 'TAG_NOT_FOUND') {
      return res.status(404).json({ message: 'Tag no encontrado' });
    }
    logger.error('tag.controller', `getTagBySlug error: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener tag' });
  }
}
