import React from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ImageDropzoneProps {
  onImageDrop: (file: File) => void;
  disabled?: boolean;
}

export function ImageDropzone({ onImageDrop, disabled = false }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxFiles: 1,
    onDrop: files => files[0] && onImageDrop(files[0]),
    disabled
  });

  return (
    <motion.div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      <input {...getInputProps()} />
      <motion.div 
        className="flex flex-col items-center text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowUpTrayIcon className="w-12 h-12 mb-4" />
        <p className="text-center">
          {isDragActive
            ? 'Drop the image here'
            : 'Drag and drop an image, or click to select'}
        </p>
        <p className="text-sm mt-2">Supports PNG, JPG, WEBP, and GIF (max 10MB)</p>
      </motion.div>
    </motion.div>
  );
}