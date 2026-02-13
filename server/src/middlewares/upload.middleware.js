import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

if (!fs.existsSync(env.MEDIA_PATH)) {
  fs.mkdirSync(env.MEDIA_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.MEDIA_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('INVALID_TYPE'), false);
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = multerInstance;
export const uploadImages = multerInstance.array('images', 8);
