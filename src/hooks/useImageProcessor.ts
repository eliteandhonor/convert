import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

interface ProcessingOptions {
  format: string;
  quality: number;
  brightness: number;
  contrast: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  blur: number;
  saturation: number;
  sepia: number;
  hueRotate: number;
  invert: boolean;
  grayscale: boolean;
  pixelate: number;
  emboss: boolean;
  tintColor: string;
  tintIntensity: number;
}

export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const validateImage = useCallback((file: File): boolean => {
    if (!file) {
      toast.error('No file selected');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 25MB');
      return false;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return false;
    }
    
    return true;
  }, []);

  const processImage = useCallback(async (
    sourceImage: File,
    options: ProcessingOptions
  ): Promise<Blob> => {
    if (!validateImage(sourceImage)) {
      throw new Error('Invalid image');
    }

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load the image
      const img = await createImageBitmap(sourceImage);
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas and set background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      
      // Apply pixelation
      if (options.pixelate > 1) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        const scale = 1 / options.pixelate;
        
        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;
        
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          tempCanvas,
          0, 0, tempCanvas.width, tempCanvas.height,
          0, 0, canvas.width, canvas.height
        );
      }
      
      // Apply emboss effect
      if (options.emboss) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const width = canvas.width;
        
        for (let i = 0; i < pixels.length; i += 4) {
          if (i % (width * 4) === 0) continue;
          
          const factor = 2;
          const r = pixels[i] - pixels[i - 4];
          const g = pixels[i + 1] - pixels[i - 3];
          const b = pixels[i + 2] - pixels[i - 2];
          
          pixels[i] = 128 + factor * r;
          pixels[i + 1] = 128 + factor * g;
          pixels[i + 2] = 128 + factor * b;
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Apply filters
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      const filters = [
        `brightness(${options.brightness}%)`,
        `contrast(${options.contrast}%)`,
        `blur(${options.blur}px)`,
        `saturate(${options.saturation}%)`,
        `sepia(${options.sepia}%)`,
        `hue-rotate(${options.hueRotate}deg)`,
        options.invert ? 'invert(100%)' : '',
        options.grayscale ? 'grayscale(100%)' : ''
      ].filter(Boolean).join(' ');
      
      tempCtx.filter = filters;
      tempCtx.drawImage(canvas, 0, 0);
      
      // Apply color tint
      if (options.tintColor !== 'none') {
        tempCtx.fillStyle = options.tintColor;
        tempCtx.globalCompositeOperation = 'multiply';
        tempCtx.globalAlpha = options.tintIntensity / 100;
        tempCtx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Convert to blob
      return new Promise((resolve) => {
        tempCanvas.toBlob(
          async (blob) => {
            if (!blob) {
              throw new Error('Failed to convert image');
            }
            
            // Compress the image if needed
            if (options.format !== 'png' && options.quality < 100) {
              const compressedFile = await imageCompression(new File([blob], 'temp.jpg', {
                type: `image/${options.format}`
              }), {
                maxSizeMB: 25,
                maxWidthOrHeight: 4096,
                useWebWorker: true,
                fileType: `image/${options.format}`,
                quality: options.quality / 100
              });
              resolve(compressedFile);
            } else {
              resolve(blob);
            }
          },
          `image/${options.format}`,
          options.format === 'png' ? undefined : options.quality / 100
        );
      });
    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }
  }, [validateImage]);

  const convertImage = useCallback(async (
    sourceImage: File,
    options: ProcessingOptions
  ): Promise<void> => {
    setIsProcessing(true);
    const startTime = performance.now();
    
    try {
      const processedBlob = await processImage(sourceImage, options);
      
      // Create download link
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      const originalName = sourceImage.name.split('.')[0];
      link.href = url;
      link.download = `${originalName}-converted.${options.format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      toast.success(`Image converted in ${processingTime}s!`);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert image');
    } finally {
      setIsProcessing(false);
    }
  }, [processImage]);

  const convertBatch = useCallback(async (
    files: File[],
    options: ProcessingOptions
  ): Promise<void> => {
    setIsProcessing(true);
    const startTime = performance.now();
    
    try {
      const zip = new JSZip();
      
      // Process all images
      const processPromises = files.map(async (file) => {
        const processedBlob = await processImage(file, options);
        const originalName = file.name.split('.')[0];
        zip.file(`${originalName}-converted.${options.format}`, processedBlob);
      });
      
      await Promise.all(processPromises);
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-images.zip`;
      link.click();
      URL.revokeObjectURL(url);
      
      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      toast.success(`${files.length} images converted in ${processingTime}s!`);
    } catch (error) {
      console.error('Batch conversion error:', error);
      toast.error('Failed to convert images');
    } finally {
      setIsProcessing(false);
    }
  }, [processImage]);

  return {
    isProcessing,
    validateImage,
    convertImage,
    convertBatch
  };
}