
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileImage, X, Copy, Check } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface OCRUploadProps {
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

const OCRUpload: React.FC<OCRUploadProps> = ({ onTextExtracted, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setProgress(0);

    try {
      const worker = await createWorker('eng');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const { data: { text } } = await worker.recognize(file);

      clearInterval(progressInterval);
      await worker.terminate();
      
      setExtractedText(text);
      setProgress(100);
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const useExtractedText = () => {
    onTextExtracted(extractedText);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl bg-[#2A2A2A] border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">OCR - Image to Text</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!imagePreview && (
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[#38B6FF] transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">Drop an image here or click to upload</p>
            <p className="text-gray-500 text-sm">Supports handwritten and printed text</p>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
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
              onClick={() => {
                setImagePreview(null);
                setExtractedText('');
                setProgress(0);
              }}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Processing image...</span>
              <span className="text-[#38B6FF]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Extracted Text */}
        {extractedText && !isProcessing && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Extracted Text:</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyText}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={useExtractedText} className="bg-[#38B6FF] hover:bg-[#2A9DE8]">
                  Use Text
                </Button>
              </div>
            </div>
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="bg-[#1E1E1E] border-gray-600 text-white min-h-[120px]"
              placeholder="Extracted text will appear here. You can edit it before using."
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default OCRUpload;
