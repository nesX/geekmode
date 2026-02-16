const REQUIRED_METHODS = ['createSession', 'verifyWebhook', 'parseWebhookEvent'];

export function validateAdapter(adapter) {
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter[method] !== 'function') {
      throw new Error(`Payment adapter missing required method: ${method}`);
    }
  }
  return adapter;
}
