import cloudinary from '../../config/cloudinary.js';
import { Readable } from 'stream';
import ApiError from '../../utils/ApiError.js';

class UploadService {
  async uploadResume(file, userId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `skillmatch/resumes/${userId}`,
          resource_type: 'raw',
          format: 'pdf',
          public_id: `resume_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            reject(ApiError.internal('Failed to upload resume'));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              size: result.bytes
            });
          }
        }
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async uploadLogo(file, userId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `skillmatch/logos/${userId}`,
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `logo_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            reject(ApiError.internal('Failed to upload logo'));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              size: result.bytes,
              width: result.width,
              height: result.height
            });
          }
        }
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      return { success: true };
    } catch (error) {
      // Silently fail if file doesn't exist
      return { success: false };
    }
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

export default new UploadService();
