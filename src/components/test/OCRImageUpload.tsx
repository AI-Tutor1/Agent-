
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OCRImageUploadProps {
  onFileUpload: (file: File) => void;
  imagePreview: string | null;
  onResetImage: () => void;
  placeholder: string;
}

const OCRImageUpload: React.FC<OCRImageUploadProps> = ({
  onFileUpload,
  imagePreview,
  onResetImage,
  placeholder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  if (imagePreview) {
    return (
      <div className="relative">
        <img
          src={imagePreview}
          alt="Uploaded for OCR"
          className="w-full max-h-64 object-contain rounded-lg border border-gray-600"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
          onClick={onResetImage}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[#38B6FF] transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-300 mb-2">Drop an image here or click to upload</p>
        <p className="text-gray-500 text-sm">{placeholder}</p>
        <div className="mt-4 flex justify-center space-x-2">
          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">Handwritten</Badge>
          <Badge variant="secondary" className="bg-green-600 text-white text-xs">Printed Text</Badge>
          <Badge variant="secondary" className="bg-purple-600 text-white text-xs">Mathematical</Badge>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

export default OCRImageUpload;
