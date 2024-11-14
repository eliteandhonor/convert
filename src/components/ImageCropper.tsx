import React from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion } from 'framer-motion';

interface ImageCropperProps {
  imageUrl: string;
  crop: Crop;
  onChange: (crop: Crop) => void;
  onComplete: (crop: Crop) => void;
  aspect?: number;
}

export function ImageCropper({
  imageUrl,
  crop,
  onChange,
  onComplete,
  aspect
}: ImageCropperProps) {
  return (
    <motion.div
      className="matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ReactCrop
        crop={crop}
        onChange={onChange}
        onComplete={onComplete}
        aspect={aspect}
        className="max-h-[600px] mx-auto"
      >
        <img src={imageUrl} alt="Crop preview" />
      </ReactCrop>
      
      <div className="mt-4 text-sm text-matrix-text/70 text-center">
        Drag to crop the image. Double-click to reset.
      </div>
    </motion.div>
  );
}