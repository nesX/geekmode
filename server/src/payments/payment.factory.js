import { env } from '../config/env.js';
import { validateAdapter } from './payment.interface.js';
import * as wompiAdapter from './wompi.adapter.js';

let cached = null;

export function getPaymentAdapter() {
  if (cached) return cached;

  switch (env.paymentProvider) {
    case 'wompi':
      cached = validateAdapter(wompiAdapter);
      break;
    default:
      throw new Error(`Unknown payment provider: ${env.paymentProvider}`);
  }

  return cached;
}
