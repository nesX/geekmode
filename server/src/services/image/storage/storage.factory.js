import LocalStorage from './local.storage.js'
import { IMAGE_CONFIG } from '../image.config.js'
import logger from '../../../utils/logger.js'

const storageProviders = {
  local: LocalStorage
}

let storageInstance = null

export function getStorage() {
  if (storageInstance) return storageInstance

  const provider = IMAGE_CONFIG.storageProvider
  const StorageClass = storageProviders[provider]

  if (!StorageClass) {
    throw new Error(
      `Storage provider "${provider}" no válido. Opciones: ${Object.keys(storageProviders).join(', ')}`
    )
  }

  storageInstance = new StorageClass()
  logger.info('storage.factory', `Image storage initialized: ${provider}`)

  return storageInstance
}
