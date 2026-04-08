
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EnhancedQuestion } from '@/types/question';

interface QuestionFormProps {
  question: EnhancedQuestion;
  onUpdate: (field: keyof EnhancedQuestion, value: any) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question-text" className="text-gray-300">Question Text</Label>
        <Textarea
          id="question-text"
          value={question.text || ''}
          onChange={(e) => onUpdate('text', e.target.value)}
          className="bg-[#2A2A2A] border-gray-600 text-white mt-1"
          placeholder="Enter your question here..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="question-type" className="text-gray-300">Question Type</Label>
          <Select value={question.subType || 'mcq'} onValueChange={(value) => onUpdate('subType', value)}>
            <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="short">Short Answer</SelectItem>
              <SelectItem value="long">Long Answer</SelectItem>
              <SelectItem value="numerical">Numerical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="marks" className="text-gray-300">Marks</Label>
          <Input
            id="marks"
            type="number"
            value={question.marks || 1}
            onChange={(e) => onUpdate('marks', parseInt(e.target.value) || 1)}
            className="bg-[#2A2A2A] border-gray-600 text-white mt-1"
            min={1}
            max={20}
          />
        </div>
      </div>

      {question.subType === 'mcq' && question.mcqOptions && (
        <div>
          <Label className="text-gray-300">Multiple Choice Options</Label>
          <div className="space-y-2 mt-2">
            {question.mcqOptions.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <span className="text-gray-400 w-6">{String.fromCharCode(65 + index)}.</span>
                <Input
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...question.mcqOptions!];
                    newOptions[index] = { ...option, text: e.target.value };
                    onUpdate('mcqOptions', newOptions);
                  }}
                  className="bg-[#2A2A2A] border-gray-600 text-white flex-1"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => {
                    const newOptions = question.mcqOptions!.map((opt, i) => ({
                      ...opt,
                      isCorrect: i === index
                    }));
                    onUpdate('mcqOptions', newOptions);
                  }}
                  className="text-[#38B6FF]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
