import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import * as imageRepo from '../repositories/image.repository.js';

function buildPublicUrl(filename) {
  return `${env.MEDIA_URL_PREFIX}/${filename}`;
}

function buildDiskPath(url) {
  return path.join(env.MEDIA_PATH, path.basename(url));
}

export async function getProductImages(productId) {
  return imageRepo.findByProductId(productId);
}

export async function uploadImage(productId, file, altText = '') {
  const existing = await imageRepo.findByProductId(productId);

  if (existing.length >= env.MAX_IMAGES_PER_PRODUCT) {
    await fs.unlink(file.path).catch(() => {});
    throw new Error('MAX_IMAGES');
  }

  const url = buildPublicUrl(file.filename);
  const image = await imageRepo.create({
    productId,
    url,
    altText,
    displayOrder: existing.length,
  });

  if (existing.length === 0) {
    return imageRepo.setPrimary(image.id, productId);
  }

  return image;
}

export async function uploadImagesForNewProduct(productId, files) {
  const images = [];
  for (let i = 0; i < files.length; i++) {
    const url = buildPublicUrl(files[i].filename);
    const image = await imageRepo.create({
      productId,
      url,
      altText: '',
      displayOrder: i,
    });
    images.push(image);
  }
  if (images.length > 0) {
    await imageRepo.setPrimary(images[0].id, productId);
  }
  return images;
}

export async function setPrimaryImage(imageId, productId) {
  const image = await imageRepo.findById(imageId);
  if (!image || image.product_id !== Number(productId)) {
    throw new Error('IMAGE_NOT_FOUND');
  }
  return imageRepo.setPrimary(imageId, productId);
}

export async function reorderImages(images) {
  await imageRepo.updateOrder(images);
}

export async function deleteImage(imageId) {
  const image = await imageRepo.findById(imageId);
  if (!image) throw new Error('IMAGE_NOT_FOUND');

  await fs.unlink(buildDiskPath(image.url)).catch(() => {
    logger.warn('image.service', `Archivo no encontrado: ${image.url}`);
  });

  await imageRepo.remove(imageId);

  if (image.is_primary) {
    const remaining = await imageRepo.findByProductId(image.product_id);
    if (remaining.length > 0) {
      await imageRepo.setPrimary(remaining[0].id, image.product_id);
    }
  }
}
