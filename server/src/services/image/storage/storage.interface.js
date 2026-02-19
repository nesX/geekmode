/**
 * Interface que todos los storage providers deben implementar
 */

/**
 * @typedef {Object} ImageVariant
 * @property {string} filename - Nombre del archivo con extensión
 * @property {Buffer} buffer - Contenido de la imagen
 * @property {number} size - Tamaño en bytes
 */

/**
 * @typedef {Object} StorageResult
 * @property {boolean} success
 * @property {string} baseName - Nombre base sin extensión ni variante
 * @property {Object.<string, string>} urls - URLs por variante
 * @property {string} [error] - Mensaje de error si falló
 */

/**
 * Todos los storage providers deben implementar:
 *
 * async save(variants: Object.<string, ImageVariant>): Promise<StorageResult>
 * async delete(baseName: string): Promise<boolean>
 * getUrl(baseName: string, variant: string): string
 */
