import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fabric } from 'fabric';
import { HexColorPicker } from 'react-colorful';
import { DocumentTextIcon, PhotoIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface WatermarkProps {
  sourceImage: File | null;
  onImageProcess: (processedImage: File) => void;
  disabled?: boolean;
}

export function Watermark({ sourceImage, onImageProcess, disabled }: WatermarkProps) {
  const [watermarkText, setWatermarkText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.5);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState<'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>('center');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      canvasRef.current = new fabric.Canvas('watermark-canvas', {
        backgroundColor: 'transparent'
      });

      return () => {
        canvasRef.current?.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (!sourceImage || !canvasRef.current) return;

    const updateCanvas = async () => {
      const url = URL.createObjectURL(sourceImage);
      fabric.Image.fromURL(url, (img) => {
        canvasRef.current!.setDimensions({
          width: img.width || 800,
          height: img.height || 600
        });
        
        img.scaleToWidth(canvasRef.current!.width!);
        canvasRef.current!.setBackgroundImage(img, canvasRef.current!.renderAll.bind(canvasRef.current));
        
        URL.revokeObjectURL(url);
      });
    };

    updateCanvas();
  }, [sourceImage]);

  const addTextWatermark = useCallback(() => {
    if (!canvasRef.current) return;

    // Remove existing watermark
    const objects = canvasRef.current.getObjects();
    objects.forEach(obj => canvasRef.current!.remove(obj));

    if (!watermarkText) return;

    const text = new fabric.Text(watermarkText, {
      fontSize,
      fill: textColor,
      opacity,
      angle,
      originX: 'center',
      originY: 'center'
    });

    const canvas = canvasRef.current;
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // Position the watermark
    switch (position) {
      case 'topLeft':
        text.set({ left: fontSize, top: fontSize });
        break;
      case 'topRight':
        text.set({ left: canvasWidth - fontSize, top: fontSize });
        break;
      case 'bottomLeft':
        text.set({ left: fontSize, top: canvasHeight - fontSize });
        break;
      case 'bottomRight':
        text.set({ left: canvasWidth - fontSize, top: canvasHeight - fontSize });
        break;
      default: // center
        text.set({ left: canvasWidth / 2, top: canvasHeight / 2 });
    }

    canvas.add(text);
    canvas.renderAll();
  }, [watermarkText, fontSize, textColor, opacity, angle, position]);

  const addImageWatermark = useCallback(async () => {
    if (!canvasRef.current || !watermarkImage) return;

    // Remove existing watermark
    const objects = canvasRef.current.getObjects();
    objects.forEach(obj => canvasRef.current!.remove(obj));

    const url = URL.createObjectURL(watermarkImage);
    
    fabric.Image.fromURL(url, (img) => {
      const canvas = canvasRef.current!;
      const maxSize = Math.min(canvas.width!, canvas.height!) / 4;
      
      if (img.width! > maxSize || img.height! > maxSize) {
        if (img.width! > img.height!) {
          img.scaleToWidth(maxSize);
        } else {
          img.scaleToHeight(maxSize);
        }
      }

      img.set({
        opacity,
        angle,
        originX: 'center',
        originY: 'center'
      });

      // Position the watermark
      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      
      switch (position) {
        case 'topLeft':
          img.set({ left: img.width! * img.scaleX! / 2, top: img.height! * img.scaleY! / 2 });
          break;
        case 'topRight':
          img.set({ left: canvasWidth - img.width! * img.scaleX! / 2, top: img.height! * img.scaleY! / 2 });
          break;
        case 'bottomLeft':
          img.set({ left: img.width! * img.scaleX! / 2, top: canvasHeight - img.height! * img.scaleY! / 2 });
          break;
        case 'bottomRight':
          img.set({ left: canvasWidth - img.width! * img.scaleX! / 2, top: canvasHeight - img.height! * img.scaleY! / 2 });
          break;
        default: // center
          img.set({ left: canvasWidth / 2, top: canvasHeight / 2 });
      }

      canvas.add(img);
      canvas.renderAll();
      URL.revokeObjectURL(url);
    });
  }, [watermarkImage, opacity, angle, position]);

  useEffect(() => {
    if (watermarkType === 'text') {
      addTextWatermark();
    } else {
      addImageWatermark();
    }
  }, [watermarkType, watermarkText, fontSize, textColor, opacity, angle, position, watermarkImage, addTextWatermark, addImageWatermark]);

  const handleApplyWatermark = async () => {
    if (!canvasRef.current || !sourceImage) return;

    const dataUrl = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const processedFile = new File([blob], sourceImage.name, { type: 'image/png' });
    onImageProcess(processedFile);
  };

  if (!sourceImage) return null;

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-matrix-text">Watermark</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setWatermarkType('text')}
            className={`matrix-button p-2 rounded-lg ${watermarkType === 'text' ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <DocumentTextIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWatermarkType('image')}
            className={`matrix-button p-2 rounded-lg ${watermarkType === 'image' ? 'bg-matrix-700' : ''}`}
            disabled={disabled}
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative">
        <canvas id="watermark-canvas" className="w-full rounded-lg matrix-border" />
      </div>

      <div className="space-y-4">
        {watermarkType === 'text' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full matrix-input rounded-lg"
                placeholder="Enter watermark text"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Font Size
              </label>
              <input
                type="range"
                min="12"
                max="200"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-matrix-glow"
                disabled={disabled}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Text Color
              </label>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full h-10 rounded-lg matrix-border"
                style={{ backgroundColor: textColor }}
                disabled={disabled}
              />
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker color={textColor} onChange={setTextColor} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-matrix-text mb-1">
              Watermark Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && setWatermarkImage(e.target.files[0])}
              className="w-full matrix-input rounded-lg"
              disabled={disabled}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Rotation
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-matrix-glow"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-matrix-text mb-1">
            Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as any)}
            className="w-full matrix-input rounded-lg"
            disabled={disabled}
          >
            <option value="center">Center</option>
            <option value="topLeft">Top Left</option>
            <option value="topRight">Top Right</option>
            <option value="bottomLeft">Bottom Left</option>
            <option value="bottomRight">Bottom Right</option>
          </select>
        </div>

        <button
          onClick={handleApplyWatermark}
          disabled={disabled || (watermarkType === 'text' && !watermarkText) || (watermarkType === 'image' && !watermarkImage)}
          className="w-full matrix-button py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
          Apply Watermark
        </button>
      </div>
    </motion.div>
  );
}