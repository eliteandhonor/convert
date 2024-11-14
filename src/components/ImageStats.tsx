import React from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ImageStatsProps {
  originalSize: number;
  processedSize?: number;
  dimensions: { width: number; height: number };
  format: string;
  processingTime?: number;
}

export function ImageStats({ 
  originalSize, 
  processedSize, 
  dimensions, 
  format,
  processingTime 
}: ImageStatsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = [
    {
      icon: DocumentIcon,
      label: 'Original Size',
      value: formatBytes(originalSize)
    },
    {
      icon: PhotoIcon,
      label: 'Format',
      value: format.toUpperCase()
    },
    {
      icon: ArrowsPointingOutIcon,
      label: 'Dimensions',
      value: `${dimensions.width} × ${dimensions.height}`
    }
  ];

  if (processedSize) {
    stats.push({
      icon: DocumentIcon,
      label: 'Processed Size',
      value: formatBytes(processedSize)
    });
  }

  if (processingTime) {
    stats.push({
      icon: ClockIcon,
      label: 'Processing Time',
      value: `${processingTime.toFixed(2)}s`
    });
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="matrix-panel p-4 rounded-lg space-y-2"
        >
          <div className="flex items-center gap-2 text-matrix-text/70">
            <stat.icon className="w-4 h-4" />
            <span className="text-sm">{stat.label}</span>
          </div>
          <p className="text-lg font-medium text-matrix-text">{stat.value}</p>
        </div>
      ))}
    </motion.div>
  );
}