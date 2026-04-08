
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Scan } from 'lucide-react';

interface Question {
  id: string;
  type: 'mcq' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  marks: number;
}

interface QuestionEditorProps {
  question: Question;
  onUpdate: (questionId: string, updatedQuestion: Partial<Question>) => void;
  onOpenOCR: (questionId: string, field: 'question' | 'option', optionIndex?: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onOpenOCR }) => {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-white text-sm">Question Text</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenOCR(question.id, 'question')}
            className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white text-xs px-2 py-1"
          >
            <Scan className="h-3 w-3 mr-1" />
            OCR
          </Button>
        </div>
        <Textarea
          value={question.question}
          onChange={(e) => onUpdate(question.id, { question: e.target.value })}
          className="bg-[#2A2A2A] border-gray-600 text-white"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={question.marks}
          onChange={(e) => onUpdate(question.id, { marks: parseInt(e.target.value) || 1 })}
          className="bg-[#2A2A2A] border-gray-600 text-white"
          placeholder="Marks"
        />
        <select
          value={question.type}
          onChange={(e) => onUpdate(question.id, { type: e.target.value as any })}
          className="bg-[#2A2A2A] border border-gray-600 text-white rounded px-3 py-2"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="short-answer">Short Answer</option>
          <option value="essay">Essay</option>
        </select>
      </div>
      {question.type === 'mcq' && (
        <div className="space-y-2">
          <Label className="text-white text-sm">Options</Label>
          {question.options?.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[optIndex] = e.target.value;
                  onUpdate(question.id, { options: newOptions });
                }}
                className="flex-1 bg-[#2A2A2A] border-gray-600 text-white"
                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenOCR(question.id, 'option', optIndex)}
                className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white text-xs px-2 py-1"
              >
                <Scan className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
