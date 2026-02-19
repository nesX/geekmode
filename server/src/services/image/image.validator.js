import sharp from 'sharp'
import { IMAGE_CONFIG } from './image.config.js'

export class ImageValidationError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ImageValidationError'
    this.code = code
  }
}

export async function validateImageFile(filepath) {
  const errors = []

  try {
    const metadata = await sharp(filepath).metadata()

    if (metadata.width < IMAGE_CONFIG.minWidth) {
      errors.push(`El ancho mínimo es ${IMAGE_CONFIG.minWidth}px (actual: ${metadata.width}px)`)
    }

    if (metadata.height < IMAGE_CONFIG.minHeight) {
      errors.push(`La altura mínima es ${IMAGE_CONFIG.minHeight}px (actual: ${metadata.height}px)`)
    }

    const aspectRatio = metadata.width / metadata.height
    const expectedRatio = IMAGE_CONFIG.requiredAspectRatio
    const tolerance = IMAGE_CONFIG.aspectRatioTolerance

    if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
      errors.push(
        `La imagen debe ser cuadrada (1:1). Dimensiones actuales: ${metadata.width}x${metadata.height}. ` +
        `Por favor edita la imagen manualmente para que sea cuadrada.`
      )
    }

    if (errors.length > 0) {
      throw new ImageValidationError(errors.join(' | '), 'INVALID_DIMENSIONS')
    }

    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size
      }
    }

  } catch (err) {
    if (err instanceof ImageValidationError) {
      throw err
    }
    throw new ImageValidationError(
      'No se pudo leer la imagen. Asegúrate de que sea un archivo de imagen válido.',
      'INVALID_FILE'
    )
  }
}
