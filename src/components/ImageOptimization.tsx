import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowsUpDownIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

interface ImageOptimizationProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
  imageEffects?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sepia?: number;
    hueRotate?: number;
    invert?: boolean;
    grayscale?: boolean;
    pixelate?: number;
    emboss?: boolean;
    tintColor?: string;
    tintIntensity?: number;
    noiseAmount?: number;
    kaleidoscope?: number;
    glitchIntensity?: number;
    colorSplash?: boolean;
    targetHue?: number;
    hueTolerance?: number;
    splitToning?: boolean;
    highlightColor?: string;
    shadowColor?: string;
  };
}

export function ImageOptimization({
  sourceImage,
  onImageProcess,
  disabled,
  imageEffects
}: ImageOptimizationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [compressQuality, setCompressQuality] = useState(0.8);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    copyright: '',
    author: '',
    software: 'Matrix Image Converter',
    processingDate: '',
    originalSize: '',
    originalDimensions: '',
    compressionSettings: {
      quality: 0,
      maxWidth: 0,
      maxHeight: 0,
      maintainAspectRatio: true
    },
    imageEffects: {},
    processingHistory: [] as string[]
  });

  const handleCompress = useCallback(async () => {
    if (!sourceImage) {
      toast.error('No image selected');
      return;
    }

    setIsProcessing(true);
    try {
      // Get original image info
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(sourceImage);
      });

      // Update metadata with original info and processing details
      const updatedMetadata = {
        ...metadata,
        processingDate: new Date().toISOString(),
        originalSize: formatBytes(sourceImage.size),
        originalDimensions: `${img.width}x${img.height}`,
        compressionSettings: {
          quality: Math.round(compressQuality * 100),
          maxWidth,
          maxHeight,
          maintainAspectRatio: maintainRatio
        },
        imageEffects: imageEffects || {},
        processingHistory: [
          `Original: ${formatBytes(sourceImage.size)} (${img.width}x${img.height})`,
          `Compression: Quality ${Math.round(compressQuality * 100)}%, Max dimensions ${maxWidth}x${maxHeight}`,
          ...(imageEffects ? [formatEffectsHistory(imageEffects)] : [])
        ]
      };

      // Calculate dimensions
      let targetWidth = maxWidth;
      let targetHeight = maxHeight;
      
      if (maintainRatio) {
        const ratio = img.width / img.height;
        if (maxWidth / maxHeight > ratio) {
          targetWidth = Math.round(maxHeight * ratio);
        } else {
          targetHeight = Math.round(maxWidth / ratio);
        }
      }

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: Math.max(targetWidth, targetHeight),
        useWebWorker: true,
        fileType: sourceImage.type as any,
        quality: compressQuality,
      };

      const compressedFile = await imageCompression(sourceImage, options);
      
      // Create metadata blob
      const metadataBlob = new Blob([JSON.stringify(updatedMetadata, null, 2)], { 
        type: 'application/json' 
      });
      
      // Combine image and metadata
      const finalBlob = new Blob([compressedFile, metadataBlob], {
        type: sourceImage.type
      });

      // Create filename with processing info
      const nameParts = sourceImage.name.split('.');
      const ext = nameParts.pop();
      const baseName = nameParts.join('.');
      const quality = Math.round(compressQuality * 100);
      const newName = `${baseName}-processed-q${quality}.${ext}`;
      
      // Create download
      const downloadUrl = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = newName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // Update image in editor
      const finalFile = new File([finalBlob], newName, {
        type: sourceImage.type,
        lastModified: Date.now()
      });
      onImageProcess(finalFile);

      // Show results
      const originalSize = sourceImage.size / (1024 * 1024);
      const compressedSize = finalBlob.size / (1024 * 1024);
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      toast.success(
        `Image optimized successfully!\n` +
        `Original: ${originalSize.toFixed(2)} MB\n` +
        `Compressed: ${compressedSize.toFixed(2)} MB\n` +
        `Saved: ${savings}%`
      );
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to optimize image. Please try again with different settings.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, maxWidth, maxHeight, maintainRatio, compressQuality, metadata, imageEffects, onImageProcess]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatEffectsHistory = (effects: any): string => {
    const activeEffects = Object.entries(effects)
      .filter(([_, value]) => value !== 0 && value !== false)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return key;
        if (typeof value === 'number') return `${key}: ${value}`;
        return `${key}: ${value}`;
      });
    return `Applied effects: ${activeEffects.join(', ')}`;
  };

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-matrix-text">Image Optimization</h3>
        <button
          onClick={() => setMaintainRatio(!maintainRatio)}
          className="matrix-button p-2 rounded-lg flex items-center gap-2"
          disabled={disabled}
        >
          {maintainRatio ? (
            <LockClosedIcon className="w-4 h-4" />
          ) : (
            <LockOpenIcon className="w-4 h-4" />
          )}
          <span>Aspect Ratio</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Max Width (px)
          </label>
          <input
            type="number"
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            min="100"
            max="8192"
            className="w-full matrix-input rounded-lg"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Max Height (px)
          </label>
          <input
            type="number"
            value={maxHeight}
            onChange={(e) => setMaxHeight(Number(e.target.value))}
            min="100"
            max="8192"
            className="w-full matrix-input rounded-lg"
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-matrix-text mb-1">
          Quality ({Math.round(compressQuality * 100)}%)
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={compressQuality * 100}
          onChange={(e) => setCompressQuality(Number(e.target.value) / 100)}
          className="w-full accent-matrix-glow"
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-matrix-text">Metadata</h4>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-matrix-text/70 mb-1">
              Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="w-full matrix-input rounded-lg"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm text-matrix-text/70 mb-1">
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              className="w-full matrix-input rounded-lg"
              rows={2}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm text-matrix-text/70 mb-1">
              Author
            </label>
            <input
              type="text"
              value={metadata.author}
              onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
              className="w-full matrix-input rounded-lg"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm text-matrix-text/70 mb-1">
              Copyright
            </label>
            <input
              type="text"
              value={metadata.copyright}
              onChange={(e) => setMetadata(prev => ({ ...prev, copyright: e.target.value }))}
              className="w-full matrix-input rounded-lg"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCompress}
        disabled={!sourceImage || isProcessing || disabled}
        className="w-full matrix-button py-2 rounded-lg flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <LoadingSpinner />
            <span>Optimizing...</span>
          </>
        ) : (
          <>
            <ArrowsUpDownIcon className="w-4 h-4" />
            <span>Optimize & Download</span>
          </>
        )}
      </button>
    </motion.div>
  );
}