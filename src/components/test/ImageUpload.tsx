
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Eye } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: { url: string; alt: string; caption?: string }) => void;
  currentImage?: { url: string; alt: string; caption?: string };
  onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  onRemoveImage
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [altText, setAltText] = useState(currentImage?.alt || '');
  const [caption, setCaption] = useState(currentImage?.caption || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onImageUpload({
          url,
          alt: altText || file.name,
          caption
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAltTextChange = (newAltText: string) => {
    setAltText(newAltText);
    if (currentImage) {
      onImageUpload({
        ...currentImage,
        alt: newAltText
      });
    }
  };

  const handleCaptionChange = (newCaption: string) => {
    setCaption(newCaption);
    if (currentImage) {
      onImageUpload({
        ...currentImage,
        caption: newCaption
      });
    }
  };

  if (currentImage) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            className="w-full h-32 object-cover rounded-lg border border-gray-600"
          />
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveImage}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <Label className="text-white text-sm">Alt Text</Label>
            <Input
              value={altText}
              onChange={(e) => handleAltTextChange(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="bg-[#2A2A2A] border-gray-600 text-white text-sm"
            />
          </div>
          <div>
            <Label className="text-white text-sm">Caption (optional)</Label>
            <Input
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="Image caption"
              className="bg-[#2A2A2A] border-gray-600 text-white text-sm"
            />
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="max-w-4xl max-h-4xl p-4">
              <div className="relative">
                <img
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="max-w-full max-h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {currentImage.caption && (
                <p className="text-white text-center mt-2">{currentImage.caption}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#38B6FF] bg-[#38B6FF]/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-400 text-sm">
          Click to upload or drag and drop
        </p>
        <p className="text-gray-500 text-xs">
          PNG, JPG, SVG up to 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-white text-sm">Alt Text</Label>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image"
            className="bg-[#2A2A2A] border-gray-600 text-white text-sm"
          />
        </div>
        <div>
          <Label className="text-white text-sm">Caption</Label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional caption"
            className="bg-[#2A2A2A] border-gray-600 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
