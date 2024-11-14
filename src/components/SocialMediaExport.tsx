import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShareIcon, 
  DocumentDuplicateIcon,
  CloudArrowDownIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

interface SocialMediaExportProps {
  processedImage: File | null;
  platform: string;
  disabled?: boolean;
}

const PLATFORM_LINKS = {
  Facebook: {
    profile: 'https://www.facebook.com/profile/pic',
    cover: 'https://www.facebook.com/profile/cover/edit',
    page: 'https://www.facebook.com/pages/profile/admin'
  },
  Instagram: {
    profile: 'https://www.instagram.com/accounts/edit/',
    story: 'https://www.instagram.com/create/story'
  },
  Twitter: {
    profile: 'https://twitter.com/settings/profile',
    header: 'https://twitter.com/settings/profile'
  },
  LinkedIn: {
    profile: 'https://www.linkedin.com/in/edit/photo',
    banner: 'https://www.linkedin.com/in/edit/background',
    company: 'https://www.linkedin.com/company/admin'
  },
  YouTube: {
    thumbnail: 'https://studio.youtube.com',
    banner: 'https://studio.youtube.com/channel/edit'
  },
  Pinterest: {
    profile: 'https://www.pinterest.com/settings',
    pin: 'https://www.pinterest.com/pin-builder/'
  },
  TikTok: {
    profile: 'https://www.tiktok.com/setting/profile',
    video: 'https://www.tiktok.com/upload'
  }
};

export function SocialMediaExport({ processedImage, platform, disabled }: SocialMediaExportProps) {
  const [copied, setCopied] = useState(false);
  const platformLinks = PLATFORM_LINKS[platform as keyof typeof PLATFORM_LINKS] || {};

  const handleCopyToClipboard = async () => {
    if (!processedImage) return;

    try {
      const blob = await processedImage.arrayBuffer().then(buffer => new Blob([buffer]));
      await navigator.clipboard.write([
        new ClipboardItem({
          [processedImage.type]: blob
        })
      ]);
      setCopied(true);
      toast.success('Image copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy image');
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    saveAs(processedImage, processedImage.name);
    toast.success('Image downloaded!');
  };

  if (!processedImage) return null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyToClipboard}
          className="matrix-button px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={disabled}
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        
        <button
          onClick={handleDownload}
          className="matrix-button px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={disabled}
        >
          <CloudArrowDownIcon className="w-5 h-5" />
          Download
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-matrix-text">Upload to {platform}</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(platformLinks).map(([type, url]) => (
            <a
              key={type}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="matrix-button px-4 py-2 rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShareIcon className="w-5 h-5" />
                {type}
              </span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50" />
            </a>
          ))}
        </div>
      </div>

      <div className="text-sm text-matrix-text/70">
        <p>Tips:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Image is optimized for {platform} {Object.keys(platformLinks)[0].toLowerCase()}</li>
          <li>Copy or download the image first, then click the upload button</li>
          <li>Make sure you're logged in to your {platform} account</li>
        </ul>
      </div>
    </motion.div>
  );
}