import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon, 
  ArrowsUpDownIcon, 
  ArrowsRightLeftIcon,
  SunIcon,
  MoonIcon,
  PhotoIcon,
  SwatchIcon,
  BackspaceIcon,
  SparklesIcon,
  CubeIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

interface ImageEffectsProps {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  rotation: number;
  onRotationChange: (value: number) => void;
  flipX: boolean;
  onFlipX: (value: boolean) => void;
  flipY: boolean;
  onFlipY: (value: boolean) => void;
  blur: number;
  onBlurChange: (value: number) => void;
  saturation: number;
  onSaturationChange: (value: number) => void;
  sepia: number;
  onSepiaChange: (value: number) => void;
  hueRotate: number;
  onHueRotateChange: (value: number) => void;
  invert: boolean;
  onInvertChange: (value: boolean) => void;
  grayscale: boolean;
  onGrayscaleChange: (value: boolean) => void;
  pixelate: number;
  onPixelateChange: (value: number) => void;
  emboss: boolean;
  onEmbossChange: (value: boolean) => void;
  tintColor: string;
  onTintColorChange: (value: string) => void;
  tintIntensity: number;
  onTintIntensityChange: (value: number) => void;
  onReset: () => void;
  disabled?: boolean;
}

const tintColors = [
  { name: 'None', value: 'none' },
  { name: 'Matrix Green', value: '#00ff00' },
  { name: 'Cyberpunk Blue', value: '#00ffff' },
  { name: 'Neon Pink', value: '#ff00ff' },
  { name: 'Retro Orange', value: '#ff6600' },
  { name: 'Vintage Sepia', value: '#704214' },
  { name: 'Cool Blue', value: '#0066ff' },
  { name: 'Warm Red', value: '#ff3333' }
];

export function ImageEffects({
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  rotation,
  onRotationChange,
  flipX,
  onFlipX,
  flipY,
  onFlipY,
  blur,
  onBlurChange,
  saturation,
  onSaturationChange,
  sepia,
  onSepiaChange,
  hueRotate,
  onHueRotateChange,
  invert,
  onInvertChange,
  grayscale,
  onGrayscaleChange,
  pixelate,
  onPixelateChange,
  emboss,
  onEmbossChange,
  tintColor,
  onTintColorChange,
  tintIntensity,
  onTintIntensityChange,
  onReset,
  disabled = false
}: ImageEffectsProps) {
  return (
    <motion.div 
      className="space-y-6 p-4 matrix-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-matrix-text glitch-effect" data-text="Image Effects">
          Image Effects
        </h3>
        <motion.button
          onClick={onReset}
          className="matrix-button p-2 rounded-lg flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        >
          <BackspaceIcon className="w-4 h-4" />
          <span>Reset</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <SunIcon className="w-4 h-4" />
            Brightness ({brightness}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <MoonIcon className="w-4 h-4" />
            Contrast ({contrast}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => onContrastChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <PhotoIcon className="w-4 h-4" />
            Saturation ({saturation}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => onSaturationChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <CubeIcon className="w-4 h-4" />
            Pixelate ({pixelate}px)
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={pixelate}
            onChange={(e) => onPixelateChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2">
            Blur ({blur}px)
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2">
            Sepia ({sepia}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sepia}
            onChange={(e) => onSepiaChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2">
            Hue Rotate ({hueRotate}°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={hueRotate}
            onChange={(e) => onHueRotateChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Rotation ({rotation}°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => onRotationChange(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-2 flex items-center gap-2">
            <PaintBrushIcon className="w-4 h-4" />
            Color Tint
          </label>
          <select
            value={tintColor}
            onChange={(e) => onTintColorChange(e.target.value)}
            className="w-full matrix-input rounded-lg mb-2"
            disabled={disabled}
          >
            {tintColors.map(color => (
              <option key={color.value} value={color.value}>{color.name}</option>
            ))}
          </select>
          {tintColor !== 'none' && (
            <div>
              <label className="block text-sm text-matrix-text/70 mb-1">
                Intensity ({tintIntensity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={tintIntensity}
                onChange={(e) => onTintIntensityChange(Number(e.target.value))}
                className="w-full accent-matrix-glow"
                disabled={disabled}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onFlipX(!flipX)}
            className={`matrix-button p-2 rounded-lg flex items-center justify-center gap-2
              ${flipX ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
            Flip X
          </button>
          <button
            onClick={() => onFlipY(!flipY)}
            className={`matrix-button p-2 rounded-lg flex items-center justify-center gap-2
              ${flipY ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <ArrowsUpDownIcon className="w-4 h-4" />
            Flip Y
          </button>
          <button
            onClick={() => onInvertChange(!invert)}
            className={`matrix-button p-2 rounded-lg flex items-center justify-center gap-2
              ${invert ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <SwatchIcon className="w-4 h-4" />
            Invert
          </button>
          <button
            onClick={() => onGrayscaleChange(!grayscale)}
            className={`matrix-button p-2 rounded-lg flex items-center justify-center gap-2
              ${grayscale ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <PhotoIcon className="w-4 h-4" />
            Grayscale
          </button>
          <button
            onClick={() => onEmbossChange(!emboss)}
            className={`matrix-button p-2 rounded-lg flex items-center justify-center gap-2
              ${emboss ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <SparklesIcon className="w-4 h-4" />
            Emboss
          </button>
        </div>
      </div>
    </motion.div>
  );
}