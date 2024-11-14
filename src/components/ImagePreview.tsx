import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  onRemove: () => void;
  style?: React.CSSProperties;
  backgroundColor: string;
}

export function ImagePreview({ imageUrl, fileName, onRemove, style, backgroundColor }: ImagePreviewProps) {
  // Create a safe URL for the image
  const safeImageUrl = React.useMemo(() => {
    try {
      return imageUrl || '';
    } catch (error) {
      console.error('Error creating image URL:', error);
      return '';
    }
  }, [imageUrl]);

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 
          shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors
          focus:outline-none focus:ring-2 focus:ring-matrix-glow z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Remove image"
      >
        <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-200" />
      </motion.button>
      <div 
        className="border dark:border-gray-700 rounded-lg overflow-hidden"
        style={{ backgroundColor }}
      >
        {safeImageUrl && (
          <img
            src={safeImageUrl}
            alt="Preview"
            className="max-w-full h-auto object-contain mx-auto"
            style={{ maxHeight: '400px', ...style }}
            onError={(e) => {
              console.error('Error loading image:', e);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center truncate" title={fileName}>
        {fileName}
      </p>
    </motion.div>
  );
}