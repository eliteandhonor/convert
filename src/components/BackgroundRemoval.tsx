import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface BackgroundRemovalProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
}

export function BackgroundRemoval({ sourceImage, onImageProcess, disabled }: BackgroundRemovalProps) {
  const [threshold, setThreshold] = useState(20);
  const [tolerance, setTolerance] = useState(30);
  const [smoothing, setSmoothing] = useState(1);
  const [featherSize, setFeatherSize] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(async () => {
    if (!sourceImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const img = await createImageBitmap(sourceImage);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Create mask for background removal
      const mask = new Uint8Array(canvas.width * canvas.height);

      // Edge detection using Sobel operator
      const sobelData = applySobelOperator(data, canvas.width, canvas.height);

      // Combine edge detection with color-based segmentation
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const idx = y * canvas.width + x;

        // Get edge strength
        const edgeStrength = sobelData[idx];

        // Color difference from potential background
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate color difference from background (assuming light background)
        const colorDiff = Math.sqrt(
          Math.pow(255 - r, 2) +
          Math.pow(255 - g, 2) +
          Math.pow(255 - b, 2)
        );

        // Combine edge and color information
        const isForeground = 
          edgeStrength > threshold ||
          colorDiff > tolerance;

        mask[idx] = isForeground ? 255 : 0;
      }

      // Apply smoothing
      if (smoothing > 0) {
        for (let i = 0; i < smoothing; i++) {
          smoothMask(mask, canvas.width, canvas.height);
        }
      }

      // Apply feathering
      if (featherSize > 0) {
        featherMask(mask, canvas.width, canvas.height, featherSize);
      }

      // Apply mask to image
      for (let i = 0; i < data.length; i += 4) {
        const idx = Math.floor(i / 4);
        const alpha = mask[idx];
        data[i + 3] = alpha;
      }

      // Update canvas with processed image
      ctx.putImageData(imageData, 0, 0);

      // Convert to PNG to preserve transparency
      const processedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Create preview URL
      const url = URL.createObjectURL(processedBlob);
      setPreviewUrl(url);

      // Create processed file
      const processedFile = new File([processedBlob], sourceImage.name.replace(/\.[^/.]+$/, '') + '-nobg.png', {
        type: 'image/png'
      });

      onImageProcess(processedFile);
    } catch (error) {
      console.error('Error removing background:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, threshold, tolerance, smoothing, featherSize]);

  // Sobel operator for edge detection
  const applySobelOperator = (data: Uint8ClampedArray, width: number, height: number) => {
    const output = new Uint8Array(width * height);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;

        for (let kernelY = -1; kernelY <= 1; kernelY++) {
          for (let kernelX = -1; kernelX <= 1; kernelX++) {
            const idx = ((y + kernelY) * width + (x + kernelX)) * 4;
            const weight = sobelX[(kernelY + 1) * 3 + (kernelX + 1)];
            pixelX += data[idx] * weight;
          }
        }

        for (let kernelY = -1; kernelY <= 1; kernelY++) {
          for (let kernelX = -1; kernelX <= 1; kernelX++) {
            const idx = ((y + kernelY) * width + (x + kernelX)) * 4;
            const weight = sobelY[(kernelY + 1) * 3 + (kernelX + 1)];
            pixelY += data[idx] * weight;
          }
        }

        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        output[y * width + x] = magnitude;
      }
    }

    return output;
  };

  // Smooth mask using box blur
  const smoothMask = (mask: Uint8Array, width: number, height: number) => {
    const temp = new Uint8Array(mask.length);
    const radius = 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              sum += mask[ny * width + nx];
              count++;
            }
          }
        }

        temp[y * width + x] = Math.round(sum / count);
      }
    }

    for (let i = 0; i < mask.length; i++) {
      mask[i] = temp[i];
    }
  };

  // Feather mask edges
  const featherMask = (mask: Uint8Array, width: number, height: number, size: number) => {
    const temp = new Uint8Array(mask.length);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -size; dy <= size; dy++) {
          for (let dx = -size; dx <= size; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= size) {
                const weight = 1 - (distance / size);
                sum += mask[ny * width + nx] * weight;
                count += weight;
              }
            }
          }
        }

        temp[y * width + x] = Math.round(sum / count);
      }
    }

    for (let i = 0; i < mask.length; i++) {
      mask[i] = temp[i];
    }
  };

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-matrix-text flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Background Removal
        </h3>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {previewUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden matrix-border bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAADFJREFUOI1j/P///38GKgETlQwbDQPGf4yMjP+pZQDVXEAtwwY4EP6jRyM1vEBtMwALADPxQUOeilB+AAAAAElFTkSuQmCC')]">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Edge Detection Threshold ({threshold})
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled || isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Color Tolerance ({tolerance})
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled || isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Edge Smoothing ({smoothing})
          </label>
          <input
            type="range"
            min="0"
            max="5"
            value={smoothing}
            onChange={(e) => setSmoothing(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled || isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Edge Feathering ({featherSize})
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={featherSize}
            onChange={(e) => setFeatherSize(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled || isProcessing}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={processImage}
            disabled={!sourceImage || disabled || isProcessing}
            className="flex-1 matrix-button py-2 rounded-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-matrix-glow rounded-full border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Remove Background
              </>
            )}
          </button>

          {previewUrl && (
            <button
              onClick={() => {
                setPreviewUrl('');
                onImageProcess(sourceImage!);
              }}
              className="matrix-button px-3 rounded-lg"
              disabled={disabled || isProcessing}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}