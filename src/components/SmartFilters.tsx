import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SmartFiltersProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
}

interface Filter {
  name: string;
  description: string;
  settings: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    sepia?: number;
    grayscale?: boolean;
    blur?: number;
    vignette?: number;
    temperature?: number;
    tint?: number;
  };
}

const filters: Filter[] = [
  {
    name: 'Vintage',
    description: 'Warm, faded look with subtle color shifts',
    settings: {
      brightness: 105,
      contrast: 95,
      saturation: 85,
      sepia: 30,
      temperature: 10,
      vignette: 20
    }
  },
  {
    name: 'Noir',
    description: 'Classic black & white with enhanced contrast',
    settings: {
      brightness: 110,
      contrast: 130,
      grayscale: true,
      vignette: 30
    }
  },
  {
    name: 'Chrome',
    description: 'High contrast with metallic tones',
    settings: {
      brightness: 115,
      contrast: 120,
      saturation: 110,
      temperature: -10
    }
  },
  {
    name: 'Fade',
    description: 'Soft, muted colors with lifted blacks',
    settings: {
      brightness: 108,
      contrast: 90,
      saturation: 85,
      temperature: 5,
      tint: 5
    }
  },
  {
    name: 'Dramatic',
    description: 'High contrast with deep shadows',
    settings: {
      brightness: 105,
      contrast: 140,
      saturation: 120,
      vignette: 40
    }
  },
  {
    name: 'Cinematic',
    description: 'Movie-like color grading',
    settings: {
      brightness: 105,
      contrast: 110,
      saturation: 95,
      temperature: -5,
      tint: 5,
      vignette: 15
    }
  },
  {
    name: 'Summer',
    description: 'Warm, vibrant colors',
    settings: {
      brightness: 110,
      contrast: 105,
      saturation: 120,
      temperature: 15
    }
  },
  {
    name: 'Cool',
    description: 'Cool tones with subtle blue shift',
    settings: {
      brightness: 105,
      contrast: 100,
      saturation: 90,
      temperature: -15,
      tint: -10
    }
  }
];

export function SmartFilters({ sourceImage, onImageProcess, disabled }: SmartFiltersProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});

  const applyFilter = useCallback(async (image: File, filter: Filter) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await createImageBitmap(image);

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Apply filter settings
    const { settings } = filter;

    // Create temporary canvas for effects
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Apply basic adjustments
    let filters = [];
    if (settings.brightness) filters.push(`brightness(${settings.brightness}%)`);
    if (settings.contrast) filters.push(`contrast(${settings.contrast}%)`);
    if (settings.saturation) filters.push(`saturate(${settings.saturation}%)`);
    if (settings.hue) filters.push(`hue-rotate(${settings.hue}deg)`);
    if (settings.sepia) filters.push(`sepia(${settings.sepia}%)`);
    if (settings.grayscale) filters.push('grayscale(100%)');
    if (settings.blur) filters.push(`blur(${settings.blur}px)`);

    tempCtx.filter = filters.join(' ');
    tempCtx.drawImage(canvas, 0, 0);

    // Apply temperature/tint
    if (settings.temperature || settings.tint) {
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Temperature (red-blue shift)
        if (settings.temperature) {
          data[i] += settings.temperature * 2; // Red
          data[i + 2] -= settings.temperature * 2; // Blue
        }

        // Tint (green-magenta shift)
        if (settings.tint) {
          data[i + 1] += settings.tint * 2; // Green
          data[i] -= settings.tint; // Red
          data[i + 2] -= settings.tint; // Blue
        }
      }

      tempCtx.putImageData(imageData, 0, 0);
    }

    // Apply vignette
    if (settings.vignette) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette / 100})`);

      tempCtx.fillStyle = gradient;
      tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Convert to blob
    return new Promise<Blob>((resolve) => {
      tempCanvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95);
    });
  }, []);

  const generatePreviews = useCallback(async () => {
    if (!sourceImage) return;

    const previews: { [key: string]: string } = {};
    
    for (const filter of filters) {
      const blob = await applyFilter(sourceImage, filter);
      previews[filter.name] = URL.createObjectURL(blob);
    }

    setPreviewUrls(previews);
  }, [sourceImage, applyFilter]);

  React.useEffect(() => {
    generatePreviews();
    return () => {
      // Cleanup preview URLs
      Object.values(previewUrls).forEach(URL.revokeObjectURL);
    };
  }, [sourceImage, generatePreviews]);

  const handleFilterSelect = async (filter: Filter) => {
    if (!sourceImage) return;

    const blob = await applyFilter(sourceImage, filter);
    const processedFile = new File([blob], sourceImage.name, { type: 'image/jpeg' });
    onImageProcess(processedFile);
    setSelectedFilter(filter.name);
  };

  if (!sourceImage) return null;

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-matrix-text flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Smart Filters
        </h3>
        {selectedFilter && (
          <button
            onClick={() => {
              setSelectedFilter(null);
              onImageProcess(sourceImage);
            }}
            className="matrix-button px-3 py-1 rounded-lg flex items-center gap-2"
            disabled={disabled}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <motion.button
            key={filter.name}
            onClick={() => handleFilterSelect(filter)}
            className={`relative group ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
          >
            <div className="aspect-square rounded-lg overflow-hidden matrix-border">
              {previewUrls[filter.name] ? (
                <img
                  src={previewUrls[filter.name]}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-matrix-800 animate-pulse" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
              <span className="text-white font-medium">{filter.name}</span>
              <span className="text-white/70 text-xs text-center">
                {filter.description}
              </span>
            </div>
            {selectedFilter === filter.name && (
              <div className="absolute inset-0 border-2 border-matrix-glow rounded-lg pointer-events-none" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}