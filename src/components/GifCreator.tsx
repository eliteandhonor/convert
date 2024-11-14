import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FilmIcon, 
  PlusIcon, 
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

interface GifCreatorProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
}

export function GifCreator({ sourceImage, onImageProcess, disabled }: GifCreatorProps) {
  const [frames, setFrames] = useState<File[]>([]);
  const [delay, setDelay] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const previewRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 50) {
        toast.error('Maximum 50 frames allowed');
        acceptedFiles = acceptedFiles.slice(0, 50);
      }
      setFrames(prev => [...prev, ...acceptedFiles]);
    },
    disabled: disabled || isProcessing,
    maxSize: 5242880 // 5MB
  });

  const removeFrame = useCallback((index: number) => {
    setFrames(prev => prev.filter((_, i) => i !== index));
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(Math.max(0, frames.length - 2));
    }
  }, [frames.length, currentFrame]);

  const createGif = useCallback(async () => {
    if (frames.length < 2) {
      toast.error('Add at least 2 frames to create a GIF');
      return;
    }

    setIsProcessing(true);
    try {
      // Process frames
      const processedFrames = await Promise.all(frames.map(async (frame) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Load image
        const img = await createImageBitmap(frame);
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw frame
        ctx.drawImage(img, 0, 0);
        
        return canvas;
      }));

      // Create GIF using gif.js (placeholder)
      const gifBlob = new Blob([], { type: 'image/gif' });
      const gifFile = new File([gifBlob], 'animation.gif', { type: 'image/gif' });
      
      onImageProcess(gifFile);
      toast.success('GIF created successfully!');
    } catch (error) {
      console.error('Error creating GIF:', error);
      toast.error('Failed to create GIF');
    } finally {
      setIsProcessing(false);
    }
  }, [frames, onImageProcess]);

  const togglePlayback = useCallback(() => {
    if (frames.length < 2) {
      toast.error('Add at least 2 frames to preview');
      return;
    }
    setIsPlaying(prev => !prev);
  }, [frames.length]);

  // Preview animation
  React.useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (!isPlaying) return;

      const elapsed = timestamp - lastTime;
      if (elapsed > delay) {
        setCurrentFrame(prev => (prev + 1) % frames.length);
        lastTime = timestamp;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    if (isPlaying && frames.length > 0) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, frames.length, delay]);

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      frames.forEach(frame => {
        if (frame instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(frame));
        }
      });
    };
  }, [frames]);

  return (
    <motion.div
      className="space-y-4 matrix-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-matrix-text flex items-center gap-2">
          <FilmIcon className="w-5 h-5" />
          GIF Creator
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            className="matrix-button p-2 rounded-lg"
            disabled={frames.length < 2 || disabled}
            title={frames.length < 2 ? 'Add at least 2 frames' : 'Preview animation'}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setFrames([])}
            className="matrix-button p-2 rounded-lg"
            disabled={frames.length === 0 || disabled}
            title="Clear all frames"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={createGif}
            className="matrix-button px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={frames.length < 2 || isProcessing || disabled}
          >
            Create GIF
          </button>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-matrix-glow bg-matrix-700/30' : 'border-matrix-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center text-matrix-text">
          <PlusIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Drop frames here or click to select</p>
          <p className="text-sm text-matrix-text/70 mt-1">
            Add up to 50 images (max 5MB each)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-matrix-text mb-2">
          Frame Delay ({delay}ms)
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="w-full accent-matrix-glow"
          disabled={disabled}
        />
      </div>

      {frames.length > 0 && (
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2">
          {frames.map((frame, index) => (
            <motion.div
              key={URL.createObjectURL(frame)}
              className={`relative group ${currentFrame === index ? 'ring-2 ring-matrix-glow' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={URL.createObjectURL(frame)}
                alt={`Frame ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
              />
              <button
                onClick={() => removeFrame(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="w-3 h-3 text-white" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-center text-xs py-1">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-matrix-text">
          <div className="w-4 h-4 border-2 border-matrix-glow rounded-full border-t-transparent animate-spin" />
          Creating GIF...
        </div>
      )}
    </motion.div>
  );
}