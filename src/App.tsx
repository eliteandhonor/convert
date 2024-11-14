import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { ImageDropzone } from './components/ImageDropzone';
import { ConversionOptions } from './components/ConversionOptions';
import { ImagePreview } from './components/ImagePreview';
import { ImageEffects } from './components/ImageEffects';
import { BatchUpload } from './components/BatchUpload';
import { MatrixBackground } from './components/MatrixBackground';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ImageComparison } from './components/ImageComparison';
import { ImageStats } from './components/ImageStats';
import { useImageProcessor } from './hooks/useImageProcessor';
import { usePreviewEffect } from './hooks/usePreviewEffect';
import { useDarkMode } from './hooks/useDarkMode';
import { AdvancedEffects } from './components/AdvancedEffects';
import { ImageOptimization } from './components/ImageOptimization';
import { MetadataViewer } from './components/MetadataViewer';
import { SmartFilters } from './components/SmartFilters';
import { BackgroundRemoval } from './components/BackgroundRemoval';
import { SocialMediaPresets } from './components/SocialMediaPresets';
import { SocialMediaExport } from './components/SocialMediaExport';
import { Watermark } from './components/Watermark';

function App() {
  const [isDark, setIsDark] = useDarkMode();
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [blur, setBlur] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [invert, setInvert] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [pixelate, setPixelate] = useState(1);
  const [emboss, setEmboss] = useState(false);
  const [tintColor, setTintColor] = useState('none');
  const [tintIntensity, setTintIntensity] = useState(50);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');

  const { isProcessing, validateImage, convertImage, convertBatch } = useImageProcessor();

  const previewUrl = usePreviewEffect({
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
  });

  const handleImageDrop = useCallback((file: File) => {
    if (validateImage(file)) {
      setSourceImage(file);
    }
  }, [validateImage]);

  const handleBatchAdd = useCallback((files: File[]) => {
    const validFiles = files.filter(validateImage);
    setBatchFiles(prev => [...prev, ...validFiles].slice(0, 10));
  }, [validateImage]);

  const handleBatchRemove = useCallback((index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetEffects = useCallback(() => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setBlur(0);
    setSaturation(100);
    setSepia(0);
    setHueRotate(0);
    setInvert(false);
    setGrayscale(false);
    setPixelate(1);
    setEmboss(false);
    setTintColor('none');
    setTintIntensity(50);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-matrix-900 transition-colors ${isDark ? 'dark' : ''}`}>
      <MatrixBackground />
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-matrix-text mb-8 glitch-effect" data-text="Matrix Image Converter">
          Matrix Image Converter
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="matrix-panel">
              <ImageDropzone 
                onImageDrop={handleImageDrop}
                disabled={isProcessing}
              />
            </div>

            {sourceImage && previewUrl && (
              <>
                <ImagePreview
                  imageUrl={previewUrl}
                  fileName={sourceImage.name}
                  onRemove={() => setSourceImage(null)}
                  backgroundColor="transparent"
                  style={{
                    filter: `
                      brightness(${brightness}%)
                      contrast(${contrast}%)
                      blur(${blur}px)
                      saturate(${saturation}%)
                      sepia(${sepia}%)
                      hue-rotate(${hueRotate}deg)
                      ${invert ? 'invert(100%)' : ''}
                      ${grayscale ? 'grayscale(100%)' : ''}
                      ${emboss ? 'url(#emboss)' : ''}
                    `,
                    transform: `
                      rotate(${rotation}deg)
                      scaleX(${flipX ? -1 : 1})
                      scaleY(${flipY ? -1 : 1})
                    `
                  }}
                />
                <ImageComparison
                  originalUrl={URL.createObjectURL(sourceImage)}
                  previewUrl={previewUrl}
                  fileName={sourceImage.name}
                />
                <ImageStats
                  originalSize={sourceImage.size}
                  dimensions={{
                    width: 800,
                    height: 600
                  }}
                  format={format}
                />
              </>
            )}

            <ImageOptimization
              sourceImage={sourceImage}
              onImageProcess={(processedImage) => setSourceImage(processedImage)}
              disabled={isProcessing}
            />

            <MetadataViewer
              sourceImage={sourceImage}
            />

            <BatchUpload
              files={batchFiles}
              onFilesAdd={handleBatchAdd}
              onFileRemove={handleBatchRemove}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-6">
            <ConversionOptions
              format={format}
              onFormatChange={setFormat}
              quality={quality}
              onQualityChange={setQuality}
              disabled={isProcessing}
            />

            <ImageEffects
              brightness={brightness}
              onBrightnessChange={setBrightness}
              contrast={contrast}
              onContrastChange={setContrast}
              rotation={rotation}
              onRotationChange={setRotation}
              flipX={flipX}
              onFlipX={setFlipX}
              flipY={flipY}
              onFlipY={setFlipY}
              blur={blur}
              onBlurChange={setBlur}
              saturation={saturation}
              onSaturationChange={setSaturation}
              sepia={sepia}
              onSepiaChange={setSepia}
              hueRotate={hueRotate}
              onHueRotateChange={setHueRotate}
              invert={invert}
              onInvertChange={setInvert}
              grayscale={grayscale}
              onGrayscaleChange={setGrayscale}
              pixelate={pixelate}
              onPixelateChange={setPixelate}
              emboss={emboss}
              onEmbossChange={setEmboss}
              tintColor={tintColor}
              onTintColorChange={setTintColor}
              tintIntensity={tintIntensity}
              onTintIntensityChange={setTintIntensity}
              onReset={resetEffects}
              disabled={isProcessing}
            />

            <AdvancedEffects
              sourceImage={sourceImage}
              originalImage={sourceImage}
              onImageProcess={(processedImage) => setSourceImage(processedImage)}
              disabled={isProcessing}
            />

            <Watermark
              sourceImage={sourceImage}
              onImageProcess={(processedImage) => setSourceImage(processedImage)}
              disabled={isProcessing}
            />

            <SmartFilters
              sourceImage={sourceImage}
              onImageProcess={(processedImage) => setSourceImage(processedImage)}
              disabled={isProcessing}
            />

            <BackgroundRemoval
              sourceImage={sourceImage}
              onImageProcess={(processedImage) => setSourceImage(processedImage)}
              disabled={isProcessing}
            />

            <div className="matrix-panel space-y-6">
              <SocialMediaPresets
                sourceImage={sourceImage}
                onImageProcess={(processedImage) => setSourceImage(processedImage)}
                disabled={isProcessing}
                selectedPlatform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />
              
              <SocialMediaExport
                processedImage={sourceImage}
                platform={selectedPlatform}
                disabled={isProcessing}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => convertImage(sourceImage!, {
                  format,
                  quality,
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
                })}
                disabled={!sourceImage || isProcessing}
                className="flex-1 matrix-button py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <LoadingSpinner /> : 'Convert & Download'}
              </button>

              {batchFiles.length > 0 && (
                <button
                  onClick={() => convertBatch(batchFiles, {
                    format,
                    quality,
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
                  })}
                  disabled={isProcessing}
                  className="flex-1 matrix-button py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <LoadingSpinner /> : 'Convert Batch'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;