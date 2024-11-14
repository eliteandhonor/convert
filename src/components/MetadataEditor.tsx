import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  CameraIcon, 
  MapPinIcon, 
  TagIcon,
  CalendarIcon,
  SwatchIcon,
  UserIcon,
  DocumentIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface MetadataEditorProps {
  sourceImage: File | null;
  onMetadataUpdate: (metadata: ImageMetadata) => void;
  disabled?: boolean;
}

interface ImageMetadata {
  title: string;
  description: string;
  author: string;
  copyright: string;
  keywords: string[];
  dateCreated: string;
  location: {
    latitude: string;
    longitude: string;
    altitude: string;
  };
  camera: {
    make: string;
    model: string;
    exposureTime: string;
    fNumber: string;
    iso: string;
    focalLength: string;
  };
  colorProfile: {
    space: 'sRGB' | 'Adobe RGB' | 'ProPhoto RGB';
    depth: '8-bit' | '16-bit';
    profile: string;
  };
  usage: {
    license: string;
    attribution: string;
    website: string;
  };
}

const defaultMetadata: ImageMetadata = {
  title: '',
  description: '',
  author: '',
  copyright: '',
  keywords: [],
  dateCreated: new Date().toISOString().split('T')[0],
  location: {
    latitude: '',
    longitude: '',
    altitude: ''
  },
  camera: {
    make: '',
    model: '',
    exposureTime: '',
    fNumber: '',
    iso: '',
    focalLength: ''
  },
  colorProfile: {
    space: 'sRGB',
    depth: '8-bit',
    profile: 'Default'
  },
  usage: {
    license: 'All Rights Reserved',
    attribution: '',
    website: ''
  }
};

export function MetadataEditor({ sourceImage, onMetadataUpdate, disabled }: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<ImageMetadata>(defaultMetadata);
  const [activeTab, setActiveTab] = useState<'basic' | 'camera' | 'location' | 'color' | 'usage'>('basic');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (sourceImage) {
      extractExistingMetadata(sourceImage);
    }
  }, [sourceImage]);

  const extractExistingMetadata = async (file: File) => {
    try {
      // Create temporary image to read EXIF data
      const arrayBuffer = await file.arrayBuffer();
      const exifData = await extractExifData(arrayBuffer);
      
      // Update metadata with extracted EXIF data
      setMetadata(prev => ({
        ...prev,
        camera: {
          ...prev.camera,
          make: exifData.make || '',
          model: exifData.model || '',
          exposureTime: exifData.exposureTime || '',
          fNumber: exifData.fNumber || '',
          iso: exifData.iso || '',
          focalLength: exifData.focalLength || ''
        },
        location: {
          ...prev.location,
          latitude: exifData.latitude || '',
          longitude: exifData.longitude || '',
          altitude: exifData.altitude || ''
        },
        dateCreated: exifData.dateCreated || prev.dateCreated
      }));

      toast.success('Existing metadata extracted');
    } catch (error) {
      console.error('Error extracting metadata:', error);
      toast.error('Failed to extract existing metadata');
    }
  };

  const extractExifData = async (arrayBuffer: ArrayBuffer) => {
    // Implement EXIF extraction (simplified version)
    const view = new DataView(arrayBuffer);
    const exifData: any = {};

    try {
      if (view.getUint16(0) === 0xFFD8) { // JPEG
        let offset = 2;
        while (offset < view.byteLength) {
          if (view.getUint16(offset) === 0xFFE1) { // APP1 marker
            const exifHeader = view.getUint32(offset + 4);
            if (exifHeader === 0x45786966) { // 'Exif'
              // Extract EXIF data here
              // This is a simplified version - in practice, you'd want a full EXIF parser
              const tiffOffset = offset + 10;
              if (view.getUint16(tiffOffset) === 0x4949) { // Little-endian
                // Parse EXIF IFD
                const ifdOffset = view.getUint32(tiffOffset + 4);
                const numEntries = view.getUint16(tiffOffset + ifdOffset);
                
                // Read entries
                let entryOffset = tiffOffset + ifdOffset + 2;
                for (let i = 0; i < numEntries; i++) {
                  const tag = view.getUint16(entryOffset);
                  // Map common EXIF tags
                  switch(tag) {
                    case 0x010F: // Make
                      exifData.make = readExifString(view, entryOffset + 8);
                      break;
                    case 0x0110: // Model
                      exifData.model = readExifString(view, entryOffset + 8);
                      break;
                    case 0x829A: // Exposure Time
                      exifData.exposureTime = view.getUint32(entryOffset + 8) + '/' + 
                                            view.getUint32(entryOffset + 12);
                      break;
                    case 0x829D: // F-Number
                      exifData.fNumber = 'f/' + (view.getUint32(entryOffset + 8) / 
                                               view.getUint32(entryOffset + 12));
                      break;
                    case 0x8827: // ISO
                      exifData.iso = view.getUint16(entryOffset + 8);
                      break;
                    case 0x920A: // Focal Length
                      exifData.focalLength = view.getUint32(entryOffset + 8) + 'mm';
                      break;
                  }
                  entryOffset += 12;
                }
              }
            }
            break;
          }
          offset += 2 + view.getUint16(offset + 2);
        }
      }
    } catch (error) {
      console.error('Error parsing EXIF:', error);
    }

    return exifData;
  };

  const readExifString = (view: DataView, offset: number): string => {
    let str = '';
    let i = 0;
    while (true) {
      const charCode = view.getUint8(offset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
      i++;
    }
    return str;
  };

  const handleMetadataChange = (
    section: keyof ImageMetadata,
    field: string,
    value: any
  ) => {
    setMetadata(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object'
        ? { ...prev[section], [field]: value }
        : value
    }));
    onMetadataUpdate(metadata);
  };

  const addKeyword = () => {
    if (newKeyword && !metadata.keywords.includes(newKeyword)) {
      setMetadata(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setMetadata(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  return (
    <motion.div
      className="space-y-4 matrix-panel p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex space-x-2 border-b border-matrix-glow/30">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 ${activeTab === 'basic' ? 'text-matrix-glow border-b-2 border-matrix-glow' : 'text-matrix-text/70'}`}
        >
          <DocumentIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-4 py-2 ${activeTab === 'camera' ? 'text-matrix-glow border-b-2 border-matrix-glow' : 'text-matrix-text/70'}`}
        >
          <CameraIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 ${activeTab === 'location' ? 'text-matrix-glow border-b-2 border-matrix-glow' : 'text-matrix-text/70'}`}
        >
          <MapPinIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`px-4 py-2 ${activeTab === 'color' ? 'text-matrix-glow border-b-2 border-matrix-glow' : 'text-matrix-text/70'}`}
        >
          <SwatchIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-2 ${activeTab === 'usage' ? 'text-matrix-glow border-b-2 border-matrix-glow' : 'text-matrix-text/70'}`}
        >
          <GlobeAltIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', '', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', '', e.target.value)}
                className="w-full matrix-input rounded-lg"
                rows={3}
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Keywords
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {metadata.keywords.map(keyword => (
                  <span
                    key={keyword}
                    className="bg-matrix-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  className="flex-1 matrix-input rounded-lg"
                  placeholder="Add keyword"
                  disabled={disabled}
                />
                <button
                  onClick={addKeyword}
                  className="matrix-button px-4 rounded-lg"
                  disabled={disabled}
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Date Created
              </label>
              <input
                type="date"
                value={metadata.dateCreated}
                onChange={(e) => handleMetadataChange('dateCreated', '', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              />
            </div>
          </>
        )}

        {activeTab === 'camera' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Camera Make
                </label>
                <input
                  type="text"
                  value={metadata.camera.make}
                  onChange={(e) => handleMetadataChange('camera', 'make', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Camera Model
                </label>
                <input
                  type="text"
                  value={metadata.camera.model}
                  onChange={(e) => handleMetadataChange('camera', 'model', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Exposure Time
                </label>
                <input
                  type="text"
                  value={metadata.camera.exposureTime}
                  onChange={(e) => handleMetadataChange('camera', 'exposureTime', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="1/125"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  F-Number
                </label>
                <input
                  type="text"
                  value={metadata.camera.fNumber}
                  onChange={(e) => handleMetadataChange('camera', 'fNumber', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="f/2.8"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  ISO
                </label>
                <input
                  type="text"
                  value={metadata.camera.iso}
                  onChange={(e) => handleMetadataChange('camera', 'iso', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="100"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Focal Length
                </label>
                <input
                  type="text"
                  value={metadata.camera.focalLength}
                  onChange={(e) => handleMetadataChange('camera', 'focalLength', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="50mm"
                  disabled={disabled}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={metadata.location.latitude}
                  onChange={(e) => handleMetadataChange('location', 'latitude', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="40.7128° N"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-matrix-text mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={metadata.location.longitude}
                  onChange={(e) => handleMetadataChange('location', 'longitude', e.target.value)}
                  className="w-full matrix-input rounded-lg"
                  placeholder="74.0060° W"
                  disabled={disabled}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Altitude
              </label>
              <input
                type="text"
                value={metadata.location.altitude}
                onChange={(e) => handleMetadataChange('location', 'altitude', e.target.value)}
                className="w-full matrix-input rounded-lg"
                placeholder="0m above sea level"
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Color Space
              </label>
              <select
                value={metadata.colorProfile.space}
                onChange={(e) => handleMetadataChange('colorProfile', 'space', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              >
                <option value="sRGB">sRGB</option>
                <option value="Adobe RGB">Adobe RGB</option>
                <option value="ProPhoto RGB">ProPhoto RGB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Bit Depth
              </label>
              <select
                value={metadata.colorProfile.depth}
                onChange={(e) => handleMetadataChange('colorProfile', 'depth', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              >
                <option value="8-bit">8-bit</option>
                <option value="16-bit">16-bit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Color Profile
              </label>
              <input
                type="text"
                value={metadata.colorProfile.profile}
                onChange={(e) => handleMetadataChange('colorProfile', 'profile', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                License
              </label>
              <select
                value={metadata.usage.license}
                onChange={(e) => handleMetadataChange('usage', 'license', e.target.value)}
                className="w-full matrix-input rounded-lg"
                disabled={disabled}
              >
                <option value="All Rights Reserved">All Rights Reserved</option>
                <option value="CC BY">Creative Commons Attribution</option>
                <option value="CC BY-SA">CC Attribution-ShareAlike</option>
                <option value="CC BY-ND">CC Attribution-NoDerivs</option>
                <option value="CC BY-NC">CC Attribution-NonCommercial</option>
                <option value="CC0">Public Domain (CC0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Attribution
              </label>
              <input
                type="text"
                value={metadata.usage.attribution}
                onChange={(e) => handleMetadataChange('usage', 'attribution', e.target.value)}
                className="w-full matrix-input rounded-lg"
                placeholder="© 2024 Your Name"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-matrix-text mb-1">
                Website
              </label>
              <input
                type="url"
                value={metadata.usage.website}
                onChange={(e) => handleMetadataChange('usage', 'website', e.target.value)}
                className="w-full matrix-input rounded-lg"
                placeholder="https://your-website.com"
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}