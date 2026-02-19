import fs from 'fs/promises';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import * as imageRepo from '../repositories/image.repository.js';
import * as imageProcessing from './image/image.service.js';

export async function getProductImages(productId) {
  return imageRepo.findByProductId(productId);
}

export async function uploadImage(productId, file, altText = '') {
  const existing = await imageRepo.findByProductId(productId);

  if (existing.length >= env.MAX_IMAGES_PER_PRODUCT) {
    await fs.unlink(file.path).catch(() => {});
    throw new Error('MAX_IMAGES');
  }

  const result = await imageProcessing.uploadProductImage(file);
  const displayOrder = existing.length;

  const image = await imageRepo.create({
    productId,
    filename: result.baseName,
    altText,
    displayOrder,
  });

  if (existing.length === 0) {
    return imageRepo.setPrimary(image.id, productId);
  }

  return image;
}

export async function uploadImagesForNewProduct(productId, files) {
  const images = [];
  for (let i = 0; i < files.length; i++) {
    const result = await imageProcessing.uploadProductImage(files[i]);
    const image = await imageRepo.create({
      productId,
      filename: result.baseName,
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

  await imageProcessing.deleteProductImage(image.filename);

  await imageRepo.remove(imageId);

  if (image.is_primary) {
    const remaining = await imageRepo.findByProductId(image.product_id);
    if (remaining.length > 0) {
      await imageRepo.setPrimary(remaining[0].id, image.product_id);
    }
  }
}
