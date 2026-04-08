
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import OCRImageUpload from './OCRImageUpload';
import OCRTextExtraction from './OCRTextExtraction';

interface TeacherOCRProps {
  onTextExtracted: (text: string, insertMode?: 'replace' | 'append') => void;
  onClose: () => void;
  title?: string;
  placeholder?: string;
}

const TeacherOCR: React.FC<TeacherOCRProps> = ({ 
  onTextExtracted, 
  onClose, 
  title = "OCR - Extract Text from Image",
  placeholder = "Upload an image to extract text for your question..."
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const useExtractedText = (mode: 'replace' | 'append' = 'replace') => {
    onTextExtracted(extractedText, mode);
    onClose();
  };

  const resetOCR = () => {
    setImagePreview(null);
    setExtractedText('');
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] bg-[#2A2A2A] border-gray-700 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Extract text from handwritten or printed content</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-4">
            {/* Image Upload */}
            <OCRImageUpload
              onFileUpload={handleFileUpload}
              imagePreview={imagePreview}
              onResetImage={resetOCR}
              placeholder={placeholder}
            />

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
              <OCRTextExtraction
                extractedText={extractedText}
                onTextChange={setExtractedText}
                onUseText={useExtractedText}
                onNewImage={resetOCR}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherOCR;
