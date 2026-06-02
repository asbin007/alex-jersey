import { Router, Request, Response } from 'express';
import multer from 'multer';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from '../../services/uploadService';

const router = Router();

// Multer configuration: memory storage, max 5 images, image types only
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Max 5 files
  },
});

// All upload routes require authentication + admin role
router.use(auth, adminAuth);

/**
 * POST /api/admin/upload
 * Upload a single image.
 * Expects multipart/form-data with field name "image".
 */
router.post(
  '/',
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const result = await uploadImage(req.file);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Image upload failed' });
    }
  }
);

/**
 * POST /api/admin/upload/multiple
 * Upload multiple images (up to 5).
 * Expects multipart/form-data with field name "images".
 */
router.post(
  '/multiple',
  upload.array('images', 5),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image files provided' });
        return;
      }

      const results = await uploadMultipleImages(files);
      res.status(200).json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Image upload failed' });
    }
  }
);

/**
 * DELETE /api/admin/upload/:publicId
 * Delete an image from Cloudinary by public ID.
 * The publicId may contain slashes (folder/filename), so we use a wildcard param.
 */
router.delete(
  '/:publicId(*)',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        res.status(400).json({ error: 'Public ID is required' });
        return;
      }

      await deleteImage(publicId);
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Image deletion failed' });
    }
  }
);

export default router;
