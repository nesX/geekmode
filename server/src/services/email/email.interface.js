/**
 * Interface que todos los email adapters deben implementar
 */

/**
 * @typedef {Object} EmailOptions
 * @property {string} to - Email del destinatario
 * @property {string} subject - Asunto del email
 * @property {string} html - Contenido HTML
 * @property {string} text - Contenido en texto plano
 */

/**
 * @typedef {Object} SendResult
 * @property {boolean} success - Si el envío fue exitoso
 * @property {string} messageId - ID del mensaje enviado
 * @property {string} [error] - Mensaje de error si falló
 */

/**
 * Todos los adapters deben implementar:
 *
 * async send(options: EmailOptions): Promise<SendResult>
 * async verify(): Promise<boolean>
 */
