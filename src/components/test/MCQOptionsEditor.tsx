
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Scan } from 'lucide-react';
import { EnhancedQuestion } from '@/types/question';
import ImageUpload from './ImageUpload';

interface MCQOptionsEditorProps {
  question: EnhancedQuestion;
  onUpdateOption: (optionId: string, field: string, value: any) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onOpenOCR: (optionId: string) => void;
}

const MCQOptionsEditor: React.FC<MCQOptionsEditorProps> = ({
  question,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onOpenOCR
}) => {
  if (question.type !== 'question' || question.subType !== 'mcq' || !question.mcqOptions) {
    return null;
  }

  return (
    <div>
      <Label className="text-white mb-2 block">Answer Options</Label>
      <div className="space-y-4">
        {question.mcqOptions.map((option, optIndex) => (
          <div key={option.id} className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => onUpdateOption(option.id, 'isCorrect', true)}
                  className="text-[#38B6FF]"
                />
                <Badge variant="secondary" className="text-xs">
                  {String.fromCharCode(65 + optIndex)}
                </Badge>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">Option {String.fromCharCode(65 + optIndex)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenOCR(option.id)}
                    className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white text-xs px-2 py-1"
                  >
                    <Scan className="h-3 w-3 mr-1" />
                    OCR
                  </Button>
                </div>
                <Textarea
                  value={option.text}
                  onChange={(e) => onUpdateOption(option.id, 'text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                  className="bg-[#2A2A2A] border-gray-600 text-white"
                  rows={2}
                />
              </div>
              {question.mcqOptions && question.mcqOptions.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveOption(option.id)}
                  className="text-red-400 hover:text-red-300 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Image Upload for MCQ Option */}
            <div>
              <Label className="text-white text-sm mb-2 block">Option Image (optional)</Label>
              <ImageUpload
                onImageUpload={(imageData) => onUpdateOption(option.id, 'image', imageData)}
                currentImage={option.image}
                onRemoveImage={() => onUpdateOption(option.id, 'image', undefined)}
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddOption}
          className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>
    </div>
  );
};

export default MCQOptionsEditor;
