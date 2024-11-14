import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';
import { ImageComparison } from './ImageComparison';

interface AdvancedEffectsProps {
  sourceImage: File | null;
  originalImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
}

export function AdvancedEffects({
  sourceImage,
  originalImage,
  onImageProcess,
  disabled
}: AdvancedEffectsProps) {
  // Basic effects
  const [noiseAmount, setNoiseAmount] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [posterize, setPosterize] = useState(0);
  const [vignette, setVignette] = useState(0);

  // Color effects
  const [duotoneEnabled, setDuotoneEnabled] = useState(false);
  const [duotoneColor1, setDuotoneColor1] = useState('#00ff00');
  const [duotoneColor2, setDuotoneColor2] = useState('#000000');
  const [colorSplash, setColorSplash] = useState(false);
  const [targetHue, setTargetHue] = useState(0);
  const [hueTolerance, setHueTolerance] = useState(20);
  const [splitToning, setSplitToning] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const [shadowColor, setShadowColor] = useState('#3f51b5');

  // Advanced effects
  const [kaleidoscope, setKaleidoscope] = useState(0);
  const [mirror, setMirror] = useState(false);
  const [mirrorAxis, setMirrorAxis] = useState<'vertical' | 'horizontal' | 'both'>('vertical');
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [textureOverlay, setTextureOverlay] = useState(false);
  const [textureOpacity, setTextureOpacity] = useState(0.5);

  // Color adjustments
  const [gamma, setGamma] = useState(1);
  const [colorBalance, setColorBalance] = useState({ r: 0, g: 0, b: 0 });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  const resetEffects = useCallback(() => {
    // Reset basic effects
    setNoiseAmount(0);
    setSharpen(0);
    setPosterize(0);
    setVignette(0);

    // Reset color effects
    setDuotoneEnabled(false);
    setDuotoneColor1('#00ff00');
    setDuotoneColor2('#000000');
    setColorSplash(false);
    setTargetHue(0);
    setHueTolerance(20);
    setSplitToning(false);
    setHighlightColor('#ffeb3b');
    setShadowColor('#3f51b5');

    // Reset advanced effects
    setKaleidoscope(0);
    setMirror(false);
    setMirrorAxis('vertical');
    setGlitchIntensity(0);
    setTextureOverlay(false);
    setTextureOpacity(0.5);

    // Reset color adjustments
    setGamma(1);
    setColorBalance({ r: 0, g: 0, b: 0 });
  }, []);

  const applyAdvancedEffects = useCallback(async (sourceImage: File) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await createImageBitmap(sourceImage);

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply effects
    if (noiseAmount > 0) {
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseAmount;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
    }

    // Apply kaleidoscope effect
    if (kaleidoscope > 0) {
      const segments = Math.floor(kaleidoscope * 8) + 2;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = (Math.PI * 2) / segments;
      
      for (let i = 0; i < segments; i++) {
        tempCtx.save();
        tempCtx.translate(centerX, centerY);
        tempCtx.rotate(angle * i);
        tempCtx.drawImage(canvas, -centerX, -centerY);
        tempCtx.restore();
      }
      
      ctx.drawImage(tempCanvas, 0, 0);
    }

    // Apply mirror effect
    if (mirror) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      if (mirrorAxis === 'vertical' || mirrorAxis === 'both') {
        ctx.scale(-1, 1);
        ctx.drawImage(canvas, -canvas.width, 0);
      }
      
      if (mirrorAxis === 'horizontal' || mirrorAxis === 'both') {
        ctx.scale(1, -1);
        ctx.drawImage(canvas, 0, -canvas.height);
      }
    }

    // Apply color splash effect
    if (colorSplash) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert RGB to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Check if the hue is within the target range
        const hueDiff = Math.abs(h - targetHue);
        if (hueDiff > hueTolerance && (360 - hueDiff) > hueTolerance) {
          // Convert to grayscale if not in range
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      }
    }

    // Apply glitch effect
    if (glitchIntensity > 0) {
      const sliceHeight = Math.floor(canvas.height / 20);
      const numSlices = Math.floor(glitchIntensity * 5);
      
      for (let i = 0; i < numSlices; i++) {
        const y = Math.floor(Math.random() * canvas.height);
        const offset = Math.floor((Math.random() - 0.5) * glitchIntensity * 50);
        
        const sliceData = ctx.getImageData(0, y, canvas.width, sliceHeight);
        ctx.putImageData(sliceData, offset, y);
      }
    }

    // Apply gamma correction
    if (gamma !== 1) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.pow(data[i] / 255, gamma) * 255;
        data[i + 1] = Math.pow(data[i + 1] / 255, gamma) * 255;
        data[i + 2] = Math.pow(data[i + 2] / 255, gamma) * 255;
      }
    }

    // Apply color balance
    if (colorBalance.r !== 0 || colorBalance.g !== 0 || colorBalance.b !== 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + colorBalance.r));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + colorBalance.g));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + colorBalance.b));
      }
    }

    // Apply split toning
    if (splitToning) {
      const highlights = hexToRgb(highlightColor);
      const shadows = hexToRgb(shadowColor);
      
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);
        
        if (brightness > 0.5) {
          data[i] = (data[i] + highlights.r) / 2;
          data[i + 1] = (data[i + 1] + highlights.g) / 2;
          data[i + 2] = (data[i + 2] + highlights.b) / 2;
        } else {
          data[i] = (data[i] + shadows.r) / 2;
          data[i + 1] = (data[i + 1] + shadows.g) / 2;
          data[i + 2] = (data[i + 2] + shadows.b) / 2;
        }
      }
    }

    // Apply the modified image data
    ctx.putImageData(imageData, 0, 0);

    // Convert canvas to blob and then to File
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve!, 'image/png'));
    const processedFile = new File([blob], sourceImage.name, { type: 'image/png' });

    return processedFile;
  }, [
    noiseAmount,
    kaleidoscope,
    mirror,
    mirrorAxis,
    colorSplash,
    targetHue,
    hueTolerance,
    glitchIntensity,
    gamma,
    colorBalance,
    splitToning,
    highlightColor,
    shadowColor
  ]);

  useEffect(() => {
    if (sourceImage) {
      const updatePreview = async () => {
        const processedFile = await applyAdvancedEffects(sourceImage);
        const url = URL.createObjectURL(processedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      };
      updatePreview();
    }
  }, [sourceImage, applyAdvancedEffects]);

  // Helper functions
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  return (
    <div className="space-y-6">
      {sourceImage && previewUrl && (
        <div className="matrix-panel p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={resetEffects}
              className="matrix-button px-4 py-2 rounded-lg flex items-center gap-2"
              disabled={disabled}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset Effects
            </button>
          </div>
          <ImageComparison
            originalUrl={originalImage ? URL.createObjectURL(originalImage) : ''}
            previewUrl={previewUrl}
            fileName={sourceImage.name}
          />
        </div>
      )}

      <div className="matrix-panel p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Effects */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-matrix-text flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Basic Effects
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-2">
                Noise ({noiseAmount})
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={noiseAmount}
                onChange={(e) => setNoiseAmount(Number(e.target.value))}
                className="w-full accent-matrix-glow"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-2">
                Kaleidoscope ({kaleidoscope})
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={kaleidoscope}
                onChange={(e) => setKaleidoscope(Number(e.target.value))}
                className="w-full accent-matrix-glow"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-2">
                Glitch Intensity ({glitchIntensity})
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={glitchIntensity}
                onChange={(e) => setGlitchIntensity(Number(e.target.value))}
                className="w-full accent-matrix-glow"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Color Effects */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-matrix-text">Color Effects</h3>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-matrix-text">
                  Color Splash
                </label>
                <button
                  onClick={() => setColorSplash(!colorSplash)}
                  className={`matrix-button px-3 py-1 rounded-lg text-sm ${
                    colorSplash ? 'bg-matrix-700' : ''
                  }`}
                  disabled={disabled}
                >
                  {colorSplash ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {colorSplash && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-matrix-text/70 mb-1">
                      Target Hue ({targetHue}°)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={targetHue}
                      onChange={(e) => setTargetHue(Number(e.target.value))}
                      className="w-full accent-matrix-glow"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-matrix-text/70 mb-1">
                      Hue Tolerance ({hueTolerance}°)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="180"
                      value={hueTolerance}
                      onChange={(e) => setHueTolerance(Number(e.target.value))}
                      className="w-full accent-matrix-glow"
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-matrix-text">
                  Split Toning
                </label>
                <button
                  onClick={() => setSplitToning(!splitToning)}
                  className={`matrix-button px-3 py-1 rounded-lg text-sm ${
                    splitToning ? 'bg-matrix-700' : ''
                  }`}
                  disabled={disabled}
                >
                  {splitToning ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {splitToning && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm text-matrix-text/70 mb-1">
                      Highlights
                    </label>
                    <HexColorPicker
                      color={highlightColor}
                      onChange={setHighlightColor}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-matrix-text/70 mb-1">
                      Shadows
                    </label>
                    <HexColorPicker
                      color={shadowColor}
                      onChange={setShadowColor}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            if (sourceImage) {
              const processedFile = await applyAdvancedEffects(sourceImage);
              onImageProcess(processedFile);
            }
          }}
          disabled={!sourceImage || disabled}
          className="w-full matrix-button py-2 rounded-lg"
        >
          Apply Effects
        </button>
      </div>
    </div>
  );
}