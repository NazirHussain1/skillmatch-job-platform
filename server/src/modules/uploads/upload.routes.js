import express from 'express';
import {
  uploadResume,
  uploadCompanyLogo,
  deleteResume,
  deleteLogo
} from './upload.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';
import { uploadResume as resumeUpload, uploadLogo as logoUpload, virusScan } from '../../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.post('/resume', resumeUpload, virusScan, uploadResume);
router.post('/logo', authorize('EMPLOYER'), logoUpload, virusScan, uploadCompanyLogo);
router.delete('/resume', deleteResume);
router.delete('/logo', authorize('EMPLOYER'), deleteLogo);

export default router;
