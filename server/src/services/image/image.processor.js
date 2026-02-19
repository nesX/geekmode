import sharp from 'sharp'
import { IMAGE_CONFIG } from './image.config.js'
import logger from '../../utils/logger.js'

export async function processImageVariants(inputPath, baseName) {
  const variants = {}

  for (const [variantName, config] of Object.entries(IMAGE_CONFIG.variants)) {
    try {
      const outputFilename = `${baseName}-${variantName}.webp`

      let pipeline = sharp(inputPath)

      if (variantName === 'original') {
        pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      } else {
        pipeline = pipeline.resize(config.width, config.height, {
          fit: 'cover',
          position: 'center'
        })
      }

      const buffer = await pipeline
        .webp({
          quality: config.quality,
          effort: 6
        })
        .toBuffer()

      variants[variantName] = {
        filename: outputFilename,
        buffer,
        size: buffer.length
      }

      logger.debug('image.processor', `Generated ${variantName}: ${outputFilename} (${buffer.length} bytes)`)

    } catch (err) {
      logger.error('image.processor', `Failed to process variant ${variantName}: ${err.message}`)
      throw new Error(`Error al procesar variante ${variantName}: ${err.message}`)
    }
  }

  return variants
}
