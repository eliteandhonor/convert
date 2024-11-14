import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SocialMediaPresetsProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
}

const SOCIAL_PRESETS = {
  Instagram: [
    { name: 'Profile Picture', width: 320, height: 320 },
    { name: 'Post', width: 1080, height: 1080 },
    { name: 'Story', width: 1080, height: 1920 },
    { name: 'Landscape', width: 1080, height: 608 },
    { name: 'Portrait', width: 1080, height: 1350 }
  ],
  Facebook: [
    { name: 'Profile Picture', width: 170, height: 170 },
    { name: 'Cover Photo', width: 851, height: 315 },
    { name: 'Post', width: 1200, height: 630 },
    { name: 'Event Cover', width: 1920, height: 1080 }
  ],
  Twitter: [
    { name: 'Profile Picture', width: 400, height: 400 },
    { name: 'Header', width: 1500, height: 500 },
    { name: 'Post', width: 1200, height: 675 }
  ],
  LinkedIn: [
    { name: 'Profile Picture', width: 400, height: 400 },
    { name: 'Cover Photo', width: 1584, height: 396 },
    { name: 'Post', width: 1200, height: 627 }
  ]
};

export function SocialMediaPresets({ 
  sourceImage, 
  onImageProcess, 
  disabled,
  selectedPlatform,
  onPlatformChange
}: SocialMediaPresetsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resizeImage = useCallback(async (width: number, height: number, name: string) => {
    if (!sourceImage) return;

    try {
      const img = await createImageBitmap(sourceImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 1);
      });

      const processedFile = new File([blob], `${name}-${sourceImage.name}`, {
        type: 'image/png'
      });

      onImageProcess(processedFile);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error resizing image:', error);
    }
  }, [sourceImage, onImageProcess]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto p-2 matrix-panel">
        {Object.keys(SOCIAL_PRESETS).map((platform) => (
          <button
            key={platform}
            onClick={() => onPlatformChange(platform)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedPlatform === platform
                ? 'bg-matrix-700 text-matrix-glow'
                : 'matrix-button'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SOCIAL_PRESETS[selectedPlatform as keyof typeof SOCIAL_PRESETS].map((preset) => (
          <motion.button
            key={preset.name}
            onClick={() => resizeImage(preset.width, preset.height, preset.name)}
            className="matrix-panel p-4 text-left hover:bg-matrix-700/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
          >
            <h3 className="font-medium text-matrix-text">{preset.name}</h3>
            <p className="text-sm text-matrix-text/70 mt-1">
              {preset.width} × {preset.height}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}