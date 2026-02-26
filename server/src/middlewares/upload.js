import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

// Memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

// File filter for resume (PDF only)
const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only PDF files are allowed for resumes'), false);
  }
};

// File filter for images (logo)
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// File size limits
const limits = {
  resume: 5 * 1024 * 1024, // 5MB
  image: 2 * 1024 * 1024   // 2MB
};

export const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: { fileSize: limits.resume }
}).single('resume');

export const uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: limits.image }
}).single('logo');

// Virus scanning simulation
export const virusScan = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Simulate virus scanning
  const suspiciousPatterns = ['<script', 'eval(', 'exec('];
  const fileContent = req.file.buffer.toString('utf8', 0, 1000);
  
  for (const pattern of suspiciousPatterns) {
    if (fileContent.includes(pattern)) {
      return next(ApiError.badRequest('File contains suspicious content'));
    }
  }

  next();
};
