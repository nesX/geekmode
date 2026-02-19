import fs from 'fs/promises'
import path from 'path'
import { IMAGE_CONFIG } from '../image.config.js'
import logger from '../../../utils/logger.js'

class LocalStorage {
  constructor() {
    this.basePath = IMAGE_CONFIG.localPath
  }

  async ensureDirectory() {
    try {
      await fs.mkdir(this.basePath, { recursive: true })
    } catch (err) {
      logger.error('storage.local', `Failed to create directory: ${err.message}`)
      throw err
    }
  }

  async save(variants) {
    await this.ensureDirectory()

    const savedFiles = []
    let baseName = null

    try {
      for (const [variantName, data] of Object.entries(variants)) {
        const filepath = path.join(this.basePath, data.filename)
        await fs.writeFile(filepath, data.buffer)
        savedFiles.push(filepath)

        if (!baseName) {
          baseName = data.filename.replace(/-\w+\.webp$/, '')
        }

        logger.info('storage.local', `Saved ${data.filename}`)
      }

      const urls = {}
      for (const variantName of Object.keys(variants)) {
        urls[variantName] = this.getUrl(baseName, variantName)
      }

      return {
        success: true,
        baseName,
        urls
      }

    } catch (err) {
      logger.error('storage.local', `Save failed, rolling back: ${err.message}`)
      await this.rollback(savedFiles)

      return {
        success: false,
        error: err.message
      }
    }
  }

  async delete(baseName) {
    const deleted = []

    for (const variantName of Object.keys(IMAGE_CONFIG.variants)) {
      const filename = `${baseName}-${variantName}.webp`
      const filepath = path.join(this.basePath, filename)

      try {
        await fs.unlink(filepath)
        deleted.push(filename)
        logger.info('storage.local', `Deleted ${filename}`)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.warn('storage.local', `Failed to delete ${filename}: ${err.message}`)
        }
      }
    }

    return deleted.length > 0
  }

  getUrl(baseName, variant) {
    return `/media/products/${baseName}-${variant}.webp`
  }

  async rollback(filepaths) {
    for (const filepath of filepaths) {
      try {
        await fs.unlink(filepath)
      } catch (err) {
        logger.error('storage.local', `Rollback failed for ${filepath}: ${err.message}`)
      }
    }
  }
}

export default LocalStorage
