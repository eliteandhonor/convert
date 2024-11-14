import React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BatchUploadProps {
  files: File[];
  onFilesAdd: (newFiles: File[]) => void;
  onFileRemove: (index: number) => void;
  disabled?: boolean;
}

export function BatchUpload({ files, onFilesAdd, onFileRemove, disabled }: BatchUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    onDrop: onFilesAdd,
    disabled
  });

  return (
    <div className="space-y-4">
      <motion.div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all
          ${isDragActive 
            ? 'border-matrix-glow bg-matrix-700/30' 
            : 'border-gray-300 dark:border-matrix-500 hover:border-matrix-glow'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        whileTap={!disabled ? { scale: 0.99 } : undefined}
      >
        <input {...getInputProps()} />
        <div className="text-center text-gray-600 dark:text-matrix-text">
          <p>Drop multiple images here or click to select</p>
          <p className="text-sm mt-2">Process up to 10 images at once</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="text-sm text-gray-600 dark:text-matrix-text">
              {files.length} files selected
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-matrix-800">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.button
                    onClick={() => onFileRemove(index)}
                    className="absolute -top-2 -right-2 p-1 rounded-full 
                      bg-red-500 text-white opacity-0 group-hover:opacity-100
                      transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </motion.button>
                  <div className="mt-1 text-xs text-gray-500 dark:text-matrix-text/70 truncate">
                    {file.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}