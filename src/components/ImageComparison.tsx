import React from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion } from 'framer-motion';

interface ImageComparisonProps {
  originalUrl: string;
  previewUrl: string;
  fileName: string;
}

export function ImageComparison({ originalUrl, previewUrl, fileName }: ImageComparisonProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative rounded-lg overflow-hidden matrix-border">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={originalUrl}
              alt="Original"
              className="object-contain"
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={previewUrl}
              alt="Preview"
              className="object-contain"
            />
          }
          position={50}
          className="aspect-video"
          style={{ height: '400px' }}
        />
        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          Original
        </div>
        <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          Preview
        </div>
      </div>
      <p className="text-sm text-center text-matrix-text/70">
        Drag slider to compare original and modified image
      </p>
    </motion.div>
  );
}