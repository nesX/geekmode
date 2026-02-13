import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

const TIMEZONE = 'America/Bogota';

function getTimestamp() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  }).replace(' ', 'T').replace(',', '.') + getOffsetString();
}

function getOffsetString() {
  const now = new Date();
  const utc = now.toLocaleString('en-US', { timeZone: 'UTC' });
  const bogota = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  const diffMs = new Date(bogota) - new Date(utc);
  const diffH = Math.floor(Math.abs(diffMs) / 3600000);
  const diffM = Math.floor((Math.abs(diffMs) % 3600000) / 60000);
  const sign = diffMs >= 0 ? '+' : '-';
  return `${sign}${String(diffH).padStart(2, '0')}:${String(diffM).padStart(2, '0')}`;
}

function getLogFilePath() {
  const date = new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE });
  return path.join(env.LOG_PATH, `${date}.log`);
}

function writeToFile(level, module, message) {
  if (!fs.existsSync(env.LOG_PATH)) {
    fs.mkdirSync(env.LOG_PATH, { recursive: true });
  }
  const line = `[${getTimestamp()}] [${level}] [${module}] ${message}\n`;
  fs.appendFileSync(getLogFilePath(), line);
}

const logger = {
  info(module, message) {
    if (env.isDevelopment) {
      console.log(`[INFO] [${module}] ${message}`);
    }
  },

  warn(module, message) {
    writeToFile('WARN', module, message);
  },

  error(module, message) {
    if (env.isDevelopment) {
      console.error(`[ERROR] [${module}] ${message}`);
    }
    writeToFile('ERROR', module, message);
  },

  debug(module, message) {
    if (env.isDevelopment) {
      writeToFile('DEBUG', module, message);
    }
  },
};

export default logger;
