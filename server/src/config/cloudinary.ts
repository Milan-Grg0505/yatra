import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };


/**
 * Extract the `public_id` from a Cloudinary secure URL.
 * Works for the standard delivery URL format:
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/folder/sub/name.jpg
 */
export function getPublicIdFromURL(url: string): string | null {
  try {
    // Matches everything after /upload/ and before the file extension
    // Handles version prefixes (v123456/) and nested folders
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:[a-zA-Z0-9]+)(?:\?|$)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Delete a single asset by its full URL.
 * Silently logs failures – never throws (deletion is best-effort).
 */
export async function deleteCloudinaryAsset(url: string): Promise<void> {
  const publicId = getPublicIdFromURL(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    logger.warn({ url, error: err }, "failed to delete cloudinary asset");
  }
}

export async function deleteCloudinaryAssets(urls: string[]): Promise<void> {
  await Promise.all(urls.map(deleteCloudinaryAsset));
}