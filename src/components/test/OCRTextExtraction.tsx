
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, FileText, Plus } from 'lucide-react';

interface OCRTextExtractionProps {
  extractedText: string;
  onTextChange: (text: string) => void;
  onUseText: (mode: 'replace' | 'append') => void;
  onNewImage: () => void;
}

const OCRTextExtraction: React.FC<OCRTextExtractionProps> = ({
  extractedText,
  onTextChange,
  onUseText,
  onNewImage
}) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-white font-medium">Extracted Text:</label>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={copyText}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={onNewImage}>
            <FileText className="h-4 w-4" />
            New Image
          </Button>
        </div>
      </div>
      <Textarea
        value={extractedText}
        onChange={(e) => onTextChange(e.target.value)}
        className="bg-[#1E1E1E] border-gray-600 text-white min-h-[120px]"
        placeholder="Extracted text will appear here. You can edit it before using."
      />
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => onUseText('append')}
          className="border-gray-600 text-gray-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Append Text
        </Button>
        <Button 
          onClick={() => onUseText('replace')} 
          className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
        >
          <FileText className="h-4 w-4 mr-2" />
          Use Text
        </Button>
      </div>
    </div>
  );
};

export default OCRTextExtraction;
