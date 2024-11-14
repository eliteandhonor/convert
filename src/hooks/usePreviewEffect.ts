import { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';

interface PreviewEffectProps {
  sourceImage: File | null;
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

export function usePreviewEffect({
  sourceImage,
  brightness,
  contrast,
  rotation,
  flipX,
  flipY,
  blur,
  saturation,
  sepia,
  hueRotate,
  invert,
  grayscale,
  pixelate,
  emboss,
  tintColor,
  tintIntensity
}: PreviewEffectProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const generatePreview = useCallback(async (img: HTMLImageElement): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set initial canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear previous content
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // Apply pixelation if needed
    if (pixelate > 1) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      const scale = 1 / pixelate;

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

    // Apply emboss effect if enabled
    if (emboss) {
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

    // Apply color tint if enabled
    if (tintColor !== 'none') {
      ctx.fillStyle = tintColor;
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = tintIntensity / 100;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Apply other effects
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `blur(${blur}px)`,
      `saturate(${saturation}%)`,
      `sepia(${sepia}%)`,
      `hue-rotate(${hueRotate}deg)`,
      invert ? 'invert(100%)' : '',
      grayscale ? 'grayscale(100%)' : ''
    ].filter(Boolean).join(' ');

    tempCtx.filter = filters;
    tempCtx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
  }, [
    brightness,
    contrast,
    rotation,
    flipX,
    flipY,
    blur,
    saturation,
    sepia,
    hueRotate,
    invert,
    grayscale,
    pixelate,
    emboss,
    tintColor,
    tintIntensity
  ]);

  useEffect(() => {
    let isMounted = true;
    let currentObjectUrl: string | null = null;

    const updatePreview = debounce(async () => {
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (!sourceImage) {
        setPreviewUrl('');
        return;
      }

      try {
        // Create new object URL
        currentObjectUrl = URL.createObjectURL(sourceImage);
        
        // Create and load image
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = currentObjectUrl;
        });

        // Generate preview
        const newPreviewUrl = await generatePreview(img);
        
        if (isMounted) {
          setPreviewUrl(newPreviewUrl);
        }
      } catch (error) {
        console.error('Preview generation error:', error);
        toast.error('Failed to generate preview');
      } finally {
        // Clean up object URL
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          currentObjectUrl = null;
        }
      }
    }, 100);

    updatePreview();

    return () => {
      isMounted = false;
      updatePreview.cancel();
      
      // Clean up URLs
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [sourceImage, generatePreview, previewUrl]);

  return previewUrl;
}