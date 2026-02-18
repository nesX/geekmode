import SmtpAdapter from './smtp.adapter.js';
import ConsoleAdapter from './console.adapter.js';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';

const adapters = {
  smtp: SmtpAdapter,
  console: ConsoleAdapter,
  // resend: ResendAdapter,  // futuro
  // sendgrid: SendGridAdapter  // futuro
};

let adapterInstance = null;

export function getEmailAdapter() {
  if (adapterInstance) return adapterInstance;

  const AdapterClass = adapters[env.EMAIL_PROVIDER];

  if (!AdapterClass) {
    throw new Error(
      `EMAIL_PROVIDER "${env.EMAIL_PROVIDER}" no válido. Opciones: ${Object.keys(adapters).join(', ')}`
    );
  }

  adapterInstance = new AdapterClass();
  logger.info('email.factory', `Email adapter initialized: ${env.EMAIL_PROVIDER}`);

  return adapterInstance;
}

export async function verifyEmailConfig() {
  const adapter = getEmailAdapter();
  const isValid = await adapter.verify();

  if (!isValid) {
    logger.warn('email.factory', 'Email configuration verification failed');
  }

  return isValid;
}
