import fs from 'fs/promises'
import { validateImageFile, ImageValidationError } from './image.validator.js'
import { processImageVariants } from './image.processor.js'
import { getStorage } from './storage/storage.factory.js'
import logger from '../../utils/logger.js'

export { ImageValidationError }

export async function uploadProductImage(file) {
  const tempPath = file.path

  try {
    logger.info('image.service', `Validating image: ${file.originalname}`)
    const validation = await validateImageFile(tempPath)

    const baseName = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}`

    logger.info('image.service', `Processing variants for ${baseName}`)
    const variants = await processImageVariants(tempPath, baseName)

    logger.info('image.service', `Saving variants to storage`)
    const storage = getStorage()
    const result = await storage.save(variants)

    if (!result.success) {
      throw new Error(result.error)
    }

    await fs.unlink(tempPath).catch(() => {})

    logger.info('image.service', `Image uploaded successfully: ${baseName}`)

    return {
      success: true,
      baseName: result.baseName,
      urls: result.urls,
      metadata: validation.metadata
    }

  } catch (err) {
    await fs.unlink(tempPath).catch(() => {})
    logger.error('image.service', `Upload failed: ${err.message}`)
    throw err
  }
}

export async function deleteProductImage(baseName) {
  try {
    const storage = getStorage()
    const deleted = await storage.delete(baseName)

    logger.info('image.service', `Image deleted: ${baseName}`)

    return { success: true, deleted }
  } catch (err) {
    logger.error('image.service', `Delete failed: ${err.message}`)
    throw err
  }
}

export function getImageUrl(baseName, variant = 'medium') {
  if (!baseName) return null
  const storage = getStorage()
  return storage.getUrl(baseName, variant)
}
