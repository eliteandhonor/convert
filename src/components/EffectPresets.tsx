import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Preset {
  name: string;
  effects: {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
    hueRotate: number;
    blur: number;
    invert: boolean;
    grayscale: boolean;
    tintColor: string;
    tintIntensity: number;
  };
}

const presets: Preset[] = [
  {
    name: 'Matrix',
    effects: {
      brightness: 110,
      contrast: 120,
      saturation: 90,
      sepia: 0,
      hueRotate: 120,
      blur: 0,
      invert: false,
      grayscale: false,
      tintColor: '#00ff00',
      tintIntensity: 30
    }
  },
  {
    name: 'Cyberpunk',
    effects: {
      brightness: 120,
      contrast: 130,
      saturation: 150,
      sepia: 0,
      hueRotate: 180,
      blur: 0,
      invert: false,
      grayscale: false,
      tintColor: '#ff00ff',
      tintIntensity: 20
    }
  },
  {
    name: 'Noir',
    effects: {
      brightness: 90,
      contrast: 140,
      saturation: 0,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: false,
      grayscale: true,
      tintColor: 'none',
      tintIntensity: 0
    }
  },
  {
    name: 'Vintage',
    effects: {
      brightness: 95,
      contrast: 90,
      saturation: 80,
      sepia: 50,
      hueRotate: 0,
      blur: 0,
      invert: false,
      grayscale: false,
      tintColor: '#704214',
      tintIntensity: 20
    }
  }
];

interface EffectPresetsProps {
  onPresetSelect: (preset: Preset['effects']) => void;
  disabled?: boolean;
}

export function EffectPresets({ onPresetSelect, disabled }: EffectPresetsProps) {
  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-matrix-text" />
        <h3 className="text-lg font-medium text-matrix-text">Effect Presets</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {presets.map((preset) => (
          <motion.button
            key={preset.name}
            onClick={() => onPresetSelect(preset.effects)}
            className="matrix-button p-3 rounded-lg text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
          >
            {preset.name}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}