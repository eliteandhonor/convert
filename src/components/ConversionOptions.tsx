import React from 'react';
import { motion } from 'framer-motion';

interface ConversionOptionsProps {
  format: string;
  onFormatChange: (format: string) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  disabled?: boolean;
}

export function ConversionOptions({
  format,
  onFormatChange,
  quality,
  onQualityChange,
  disabled = false
}: ConversionOptionsProps) {
  return (
    <motion.div 
      className="space-y-4 p-4 matrix-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="block text-sm font-medium text-matrix-text mb-1" htmlFor="format">
          Output Format
        </label>
        <select
          id="format"
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
          className="w-full rounded-lg matrix-input"
          disabled={disabled}
        >
          <option value="png">PNG - Lossless Quality</option>
          <option value="jpeg">JPEG - Small File Size</option>
          <option value="webp">WebP - Modern Format</option>
          <option value="avif">AVIF - Next-Gen Format</option>
          <option value="tiff">TIFF - Professional Use</option>
          <option value="bmp">BMP - Basic Format</option>
        </select>
        <p className="mt-1 text-sm text-matrix-text/70">
          {format === 'png' && 'Best for images requiring perfect quality'}
          {format === 'jpeg' && 'Ideal for photographs and complex images'}
          {format === 'webp' && 'Modern format with excellent compression'}
          {format === 'avif' && 'Next-generation format with superior compression'}
          {format === 'tiff' && 'Professional format for high-quality images'}
          {format === 'bmp' && 'Basic format with no compression'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-matrix-text mb-1" htmlFor="quality">
          Quality ({quality}%)
        </label>
        <input
          id="quality"
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => onQualityChange(Number(e.target.value))}
          className="w-full accent-matrix-glow disabled:opacity-50"
          disabled={disabled || format === 'png' || format === 'bmp'}
        />
        <div className="flex justify-between text-xs text-matrix-text/70">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
        {(format === 'png' || format === 'bmp') && (
          <p className="mt-1 text-sm text-matrix-text/70">
            Quality setting is not applicable for {format.toUpperCase()} format
          </p>
        )}
      </div>
    </motion.div>
  );
}