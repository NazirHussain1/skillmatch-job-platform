import express from 'express';
import {
  uploadResume,
  uploadCompanyLogo,
  deleteResume,
  deleteLogo
} from './upload.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';
import { 
  uploadResume as resumeUpload, 
  uploadLogo as logoUpload, 
  virusScan,
  validateFileType
} from '../../middlewares/upload.js';
import { uploadLimiter } from '../../config/security.js';

const router = express.Router();

router.use(protect);

router.post(
  '/resume',
  uploadLimiter,
  resumeUpload,
  validateFileType('pdf'),
  virusScan,
  uploadResume
);

router.post(
  '/logo',
  uploadLimiter,
  authorize('EMPLOYER'),
  logoUpload,
  validateFileType('image'),
  virusScan,
  uploadCompanyLogo
);

router.delete('/resume', deleteResume);
router.delete('/logo', authorize('EMPLOYER'), deleteLogo);

export default router;
