import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Construct URL for the uploaded file
  // In a real app, you would use S3 or cloud storage.
  // Here we serve it locally.
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({ url: fileUrl });
});

export default router;
