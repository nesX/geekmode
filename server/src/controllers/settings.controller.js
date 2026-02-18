import { z } from 'zod';
import * as settingsService from '../services/settings.service.js';
import logger from '../utils/logger.js';

const UpdateSettingSchema = z.object({
  value: z.string().min(1),
});

export async function getPublicSettings(req, res) {
  try {
    const settings = await settingsService.getPublicSettings();
    res.json({ settings });
  } catch (err) {
    logger.error('settings.controller', `Error fetching settings: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
}

export async function updateSetting(req, res) {
  try {
    const { value } = UpdateSettingSchema.parse(req.body);
    const setting = await settingsService.updateSetting(req.params.key, value);
    res.json({ setting });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos inválidos', errors: err.errors });
    }
    if (err.message === 'SETTING_NOT_FOUND') {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    if (err.message === 'INVALID_FORMAT') {
      return res.status(400).json({ message: 'Formato inválido para este campo' });
    }
    logger.error('settings.controller', `Error updating setting: ${err.message}`);
    res.status(500).json({ message: 'Error al actualizar configuración' });
  }
}
