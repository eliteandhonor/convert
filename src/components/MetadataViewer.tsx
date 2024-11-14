import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface MetadataViewerProps {
  sourceImage: File | null;
  customMetadata?: {
    title?: string;
    description?: string;
    copyright?: string;
    author?: string;
  };
}

interface ImageMetadata {
  dimensions: { width: number; height: number };
  size: string;
  type: string;
  lastModified: string;
  exif?: { [key: string]: any };
}

export function MetadataViewer({ sourceImage, customMetadata }: MetadataViewerProps) {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!sourceImage) {
      setMetadata(null);
      return;
    }

    const loadMetadata = async () => {
      // Basic metadata
      const basicMetadata: ImageMetadata = {
        dimensions: { width: 0, height: 0 },
        size: formatBytes(sourceImage.size),
        type: sourceImage.type,
        lastModified: new Date(sourceImage.lastModified).toLocaleString(),
      };

      // Get image dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(sourceImage);
      
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        
        basicMetadata.dimensions = {
          width: img.width,
          height: img.height
        };

        // Try to extract EXIF data if available
        if (sourceImage.type === 'image/jpeg' || sourceImage.type === 'image/tiff') {
          const arrayBuffer = await sourceImage.arrayBuffer();
          const exifData = await extractExifData(arrayBuffer);
          if (Object.keys(exifData).length > 0) {
            basicMetadata.exif = exifData;
          }
        }

        setMetadata(basicMetadata);
      } catch (error) {
        console.error('Error loading image metadata:', error);
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    };

    loadMetadata();
  }, [sourceImage]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractExifData = async (arrayBuffer: ArrayBuffer) => {
    // Simple EXIF extraction (basic implementation)
    const view = new DataView(arrayBuffer);
    const exifData: { [key: string]: any } = {};

    try {
      let offset = 0;
      // Check for JPEG marker
      if (view.getUint16(offset) === 0xFFD8) {
        offset += 2;
        // Look for EXIF marker
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset);
          if ((marker & 0xFF00) !== 0xFF00) break;
          offset += 2;
          
          if (marker === 0xFFE1) { // APP1 marker (contains EXIF)
            const length = view.getUint16(offset);
            const exifHeader = view.getUint32(offset + 2);
            if (exifHeader === 0x45786966) { // 'Exif'
              // Extract basic EXIF data (simplified)
              exifData.orientation = view.getUint16(offset + 8);
              // Add more EXIF data extraction as needed
            }
            offset += length;
          } else {
            offset += view.getUint16(offset);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
    }

    return exifData;
  };

  if (!sourceImage || !metadata) return null;

  return (
    <motion.div
      className="matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-matrix-text"
      >
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="w-5 h-5" />
          <span className="font-medium">Image Metadata</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          className="mt-4 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-matrix-text mb-2">File Information</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-matrix-text/70">Name:</dt>
                  <dd className="text-matrix-text">{sourceImage.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-matrix-text/70">Type:</dt>
                  <dd className="text-matrix-text">{metadata.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-matrix-text/70">Size:</dt>
                  <dd className="text-matrix-text">{metadata.size}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-matrix-text/70">Dimensions:</dt>
                  <dd className="text-matrix-text">
                    {metadata.dimensions.width} × {metadata.dimensions.height}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-matrix-text/70">Last Modified:</dt>
                  <dd className="text-matrix-text">{metadata.lastModified}</dd>
                </div>
              </dl>
            </div>

            {customMetadata && Object.keys(customMetadata).some(key => customMetadata[key as keyof typeof customMetadata]) && (
              <div>
                <h4 className="text-sm font-medium text-matrix-text mb-2">Custom Metadata</h4>
                <dl className="space-y-1 text-sm">
                  {customMetadata.title && (
                    <div className="flex justify-between">
                      <dt className="text-matrix-text/70">Title:</dt>
                      <dd className="text-matrix-text">{customMetadata.title}</dd>
                    </div>
                  )}
                  {customMetadata.author && (
                    <div className="flex justify-between">
                      <dt className="text-matrix-text/70">Author:</dt>
                      <dd className="text-matrix-text">{customMetadata.author}</dd>
                    </div>
                  )}
                  {customMetadata.copyright && (
                    <div className="flex justify-between">
                      <dt className="text-matrix-text/70">Copyright:</dt>
                      <dd className="text-matrix-text">{customMetadata.copyright}</dd>
                    </div>
                  )}
                </dl>
                {customMetadata.description && (
                  <div className="mt-2">
                    <dt className="text-sm text-matrix-text/70">Description:</dt>
                    <dd className="text-sm text-matrix-text mt-1">{customMetadata.description}</dd>
                  </div>
                )}
              </div>
            )}
          </div>

          {metadata.exif && Object.keys(metadata.exif).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-matrix-text mb-2">EXIF Data</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(metadata.exif).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-matrix-text/70">{key}:</dt>
                    <dd className="text-matrix-text">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}