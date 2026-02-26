import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const FileUpload = ({ type = 'resume', onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const config = {
    resume: {
      accept: '.pdf',
      maxSize: 5 * 1024 * 1024, // 5MB
      title: 'Upload Resume',
      description: 'PDF only, max 5MB',
      icon: File
    },
    logo: {
      accept: 'image/jpeg,image/jpg,image/png,image/webp',
      maxSize: 2 * 1024 * 1024, // 2MB
      title: 'Upload Company Logo',
      description: 'JPEG, PNG, WebP, max 2MB',
      icon: Upload
    }
  };

  const currentConfig = config[type];

  const validateFile = (file) => {
    if (type === 'resume' && file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for resumes');
      return false;
    }

    if (type === 'logo' && !file.type.startsWith('image/')) {
      toast.error('Only image files are allowed for logos');
      return false;
    }

    if (file.size > currentConfig.maxSize) {
      const sizeMB = (currentConfig.maxSize / (1024 * 1024)).toFixed(0);
      toast.error(`File size must be less than ${sizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (type === 'logo') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await fetch(`http://localhost:5000/api/uploads/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${type === 'resume' ? 'Resume' : 'Logo'} uploaded successfully!`);
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
        setFile(null);
        setPreview(null);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/uploads/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${type === 'resume' ? 'Resume' : 'Logo'} deleted successfully!`);
        if (onUploadSuccess) {
          onUploadSuccess(null);
        }
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const Icon = currentConfig.icon;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-50
                ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={currentConfig.accept}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <motion.div
                animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center"
              >
                <Icon className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentConfig.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {currentConfig.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Choose File
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full"
          >
            <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
              {/* Preview */}
              <div className="flex items-start gap-4 mb-4">
                {preview ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <File className="w-10 h-10 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Ready to upload</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
