export const IMAGE_CONFIG = {
  // Validación
  minWidth: 800,
  minHeight: 800,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // Aspect ratio
  requiredAspectRatio: 1, // 1:1 (cuadrado)
  aspectRatioTolerance: 0.01, // 1% de tolerancia

  // Variantes a generar
  variants: {
    thumb: {
      width: 400,
      height: 400,
      quality: 85
    },
    medium: {
      width: 800,
      height: 800,
      quality: 85
    },
    large: {
      width: 1200,
      height: 1200,
      quality: 85
    },
    original: {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 90
    }
  },

  // Storage
  storageProvider: process.env.IMAGE_STORAGE || 'local',
  localPath: process.env.MEDIA_PATH || 'uploads/products'
}
