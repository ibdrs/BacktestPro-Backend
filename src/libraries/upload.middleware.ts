import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Create the uploads directory if it doesn't already exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    // Append a timestamp
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

// Reject anything that isn't a CSV file
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isCsv =
    file.mimetype === 'text/csv' ||
    path.extname(file.originalname).toLowerCase() === '.csv';

  if (isCsv) {
    cb(null, true);
  } else {
    cb(new Error('Only .csv files are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// Wraps the error instead of crashing the process
export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
};
