import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Build a multer instance that uploads to `<root>/<folder>` on Cloudinary.
 */
function buildUploader(folder: string): multer.Multer {
  // Cast: types from multer-storage-cloudinary lag behind cloudinary v2
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
    }),
  }) as unknown as StorageEngine;

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new ApiError(400, `Invalid file type: ${file.mimetype}`));
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
}

export const uploadUser = buildUploader('users');
export const uploadHotel = buildUploader('hotels');
export const uploadRoom = buildUploader('rooms');
export const uploadBlog = buildUploader('blogs');
export const uploadCity = buildUploader('cities');
export const uploadHero = buildUploader('hero');
export const uploadReview = buildUploader('reviews');
export const uploadTravel = buildUploader('travel');
export const uploadIdProof = buildUploader('id_proofs');
