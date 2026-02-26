import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

// File signature validation (magic numbers)
const FILE_SIGNATURES = {
  pdf: {
    signature: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    offset: 0
  },
  jpeg: {
    signature: Buffer.from([0xFF, 0xD8, 0xFF]),
    offset: 0
  },
  png: {
    signature: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    offset: 0
  },
  webp: {
    signature: Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF
    offset: 0,
    secondaryCheck: Buffer.from([0x57, 0x45, 0x42, 0x50]), // WEBP at offset 8
    secondaryOffset: 8
  }
};

// Validate file signature
const validateFileSignature = (buffer, expectedType) => {
  const sig = FILE_SIGNATURES[expectedType];
  if (!sig) return false;

  // Check primary signature
  const fileHeader = buffer.slice(sig.offset, sig.offset + sig.signature.length);
  if (!fileHeader.equals(sig.signature)) {
    return false;
  }

  // Check secondary signature if exists (for WebP)
  if (sig.secondaryCheck) {
    const secondaryHeader = buffer.slice(
      sig.secondaryOffset,
      sig.secondaryOffset + sig.secondaryCheck.length
    );
    if (!secondaryHeader.equals(sig.secondaryCheck)) {
      return false;
    }
  }

  return true;
};

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

// File signature validation middleware
export const validateFileType = (expectedType) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const buffer = req.file.buffer;
    let isValid = false;

    if (expectedType === 'pdf') {
      isValid = validateFileSignature(buffer, 'pdf');
    } else if (expectedType === 'image') {
      // Check for any valid image signature
      isValid = validateFileSignature(buffer, 'jpeg') ||
                validateFileSignature(buffer, 'png') ||
                validateFileSignature(buffer, 'webp');
    }

    if (!isValid) {
      return next(ApiError.badRequest('File signature validation failed. File may be corrupted or not a valid ' + expectedType));
    }

    next();
  };
};

// Virus scanning simulation
export const virusScan = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Simulate virus scanning
  const suspiciousPatterns = ['<script', 'eval(', 'exec(', 'system(', 'shell_exec'];
  const fileContent = req.file.buffer.toString('utf8', 0, Math.min(1000, req.file.buffer.length));
  
  for (const pattern of suspiciousPatterns) {
    if (fileContent.toLowerCase().includes(pattern.toLowerCase())) {
      console.warn(`Suspicious content detected in file: ${req.file.originalname}`);
      return next(ApiError.badRequest('File contains suspicious content and was rejected'));
    }
  }

  // Check for executable extensions in filename
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js'];
  const filename = req.file.originalname.toLowerCase();
  
  for (const ext of dangerousExtensions) {
    if (filename.endsWith(ext)) {
      return next(ApiError.badRequest('Executable files are not allowed'));
    }
  }

  next();
};
