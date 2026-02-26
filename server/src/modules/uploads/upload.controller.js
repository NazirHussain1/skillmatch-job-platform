import uploadService from './upload.service.js';
import userRepository from '../users/user.repository.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const user = await userRepository.findById(req.user._id);
  
  // Delete old resume if exists
  if (user.resumePublicId) {
    await uploadService.deleteFile(user.resumePublicId);
  }

  const result = await uploadService.uploadResume(req.file, req.user._id);

  // Update user profile
  await userRepository.update(req.user._id, {
    resumeUrl: result.url,
    resumePublicId: result.publicId
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Resume uploaded successfully')
  );
});

export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  if (req.user.role !== 'EMPLOYER') {
    throw ApiError.forbidden('Only employers can upload company logos');
  }

  const user = await userRepository.findById(req.user._id);
  
  // Delete old logo if exists
  if (user.logoPublicId) {
    await uploadService.deleteImage(user.logoPublicId);
  }

  const result = await uploadService.uploadLogo(req.file, req.user._id);

  // Update user profile
  await userRepository.update(req.user._id, {
    companyLogo: result.url,
    logoPublicId: result.publicId
  });

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Company logo uploaded successfully')
  );
});

export const deleteResume = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user._id);

  if (user.resumePublicId) {
    await uploadService.deleteFile(user.resumePublicId);
    await userRepository.update(req.user._id, {
      resumeUrl: null,
      resumePublicId: null
    });
  }

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, 'Resume deleted successfully')
  );
});

export const deleteLogo = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user._id);

  if (user.logoPublicId) {
    await uploadService.deleteImage(user.logoPublicId);
    await userRepository.update(req.user._id, {
      companyLogo: null,
      logoPublicId: null
    });
  }

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, 'Company logo deleted successfully')
  );
});
