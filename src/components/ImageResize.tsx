import React from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

interface ImageResizeProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  maintainAspectRatio: boolean;
  onAspectRatioChange: (maintain: boolean) => void;
  originalAspectRatio: number;
  disabled?: boolean;
}

export function ImageResize({
  width,
  height,
  onWidthChange,
  onHeightChange,
  maintainAspectRatio,
  onAspectRatioChange,
  originalAspectRatio,
  disabled
}: ImageResizeProps) {
  const handleWidthChange = (newWidth: number) => {
    onWidthChange(newWidth);
    if (maintainAspectRatio) {
      onHeightChange(Math.round(newWidth / originalAspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    onHeightChange(newHeight);
    if (maintainAspectRatio) {
      onWidthChange(Math.round(newHeight * originalAspectRatio));
    }
  };

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-matrix-text">Resize Image</h3>
        <button
          onClick={() => onAspectRatioChange(!maintainAspectRatio)}
          className="matrix-button p-2 rounded-lg flex items-center gap-2"
          disabled={disabled}
        >
          {maintainAspectRatio ? (
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
            Width (px)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            min="1"
            max="10000"
            className="w-full matrix-input rounded-lg"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            min="1"
            max="10000"
            className="w-full matrix-input rounded-lg"
            disabled={disabled}
          />
        </div>
      </div>
    </motion.div>
  );
}