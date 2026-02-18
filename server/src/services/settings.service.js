import * as settingsRepo from '../repositories/settings.repository.js';

const PUBLIC_KEYS = [
  'contact_whatsapp',
  'contact_email',
  'contact_instagram',
  'shipping_time',
  'free_shipping_message',
];

export async function getAllSettings() {
  return settingsRepo.findAll();
}

export async function getPublicSettings() {
  const all = await settingsRepo.findAll();
  return all.filter((s) => PUBLIC_KEYS.includes(s.key));
}

export async function updateSetting(key, value) {
  if (key.includes('whatsapp')) {
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    if (!/^\+\d{10,15}$/.test(cleaned)) {
      throw new Error('INVALID_FORMAT');
    }
  }

  if (key.includes('email')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('INVALID_FORMAT');
    }
  }

  if (key.includes('instagram')) {
    value = value.startsWith('@') ? value : `@${value}`;
  }

  return settingsRepo.update(key, value);
}
