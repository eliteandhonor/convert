import React from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface BatchProcessingProps {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onProcessAll: (options: any) => void;
  disabled?: boolean;
}

export function BatchProcessing({
  files,
  onFilesAdd,
  onFileRemove,
  onProcessAll,
  disabled
}: BatchProcessingProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    onDrop: onFilesAdd,
    disabled
  });

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-matrix-text">Batch Processing</h3>
        <span className="text-sm text-matrix-text/70">
          {files.length} files selected
        </span>
      </div>

      <div
        {...getRootProps()}
        className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-matrix-glow bg-matrix-700/30' : 'border-matrix-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center text-matrix-text">
          <ArrowsUpDownIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Drop images here or click to select</p>
          <p className="text-sm text-matrix-text/70 mt-1">
            Process multiple images at once
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2">
          {files.map((file, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => onFileRemove(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
              <p className="text-xs text-matrix-text/70 mt-1 truncate">
                {file.name}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}