import cloudinary from '../config/cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a single image to Cloudinary with WebP transformation
 * and mobile-optimized dimensions.
 */
export async function uploadImage(
  file: Express.Multer.File
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'nepal-jersey',
        format: 'webp',
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'webp',
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
}

/**
 * Upload multiple images to Cloudinary (max 5).
 */
export async function uploadMultipleImages(
  files: Express.Multer.File[]
): Promise<UploadResult[]> {
  const limitedFiles = files.slice(0, 5);
  const uploadPromises = limitedFiles.map((file) => uploadImage(file));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
