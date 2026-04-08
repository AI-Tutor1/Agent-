
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkIcon, Trash2 } from 'lucide-react';
import { EnhancedQuestion } from '@/types/question';

interface QuestionHeaderProps {
  question: EnhancedQuestion;
  onUpdate: (field: keyof EnhancedQuestion, value: any) => void;
  onRemove: () => void;
  onOpenAssociation: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  question,
  onUpdate,
  onRemove,
  onOpenAssociation
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex space-x-4 flex-1">
          <div className="flex-1">
            <Label className="text-white mb-2 block">Statement Type</Label>
            <Select 
              value={question.type} 
              onValueChange={(value) => onUpdate('type', value)}
            >
              <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-gray-600">
                <SelectItem value="main-statement">Main Statement</SelectItem>
                <SelectItem value="child-statement">Child Statement</SelectItem>
                <SelectItem value="diagram">Diagram</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {question.type === 'question' && (
            <div className="flex-1">
              <Label className="text-white mb-2 block">Question Type</Label>
              <Select 
                value={question.subType || ''} 
                onValueChange={(value) => onUpdate('subType', value)}
              >
                <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-gray-600">
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                  <SelectItem value="long">Long Answer</SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="equation">Equation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {question.type === 'question' && (
            <div className="w-24">
              <Label className="text-white mb-2 block">Marks</Label>
              <Input
                type="number"
                value={question.marks || ''}
                onChange={(e) => onUpdate('marks', parseInt(e.target.value) || 0)}
                className="bg-[#2A2A2A] border-gray-600 text-white"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {question.type === 'question' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAssociation}
              className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Number Display */}
      {question.type === 'question' && (
        <div>
          <Badge variant="secondary" className="bg-[#38B6FF] text-white">
            Question {question.questionNumber}
          </Badge>
        </div>
      )}

      {/* Metadata Display */}
      {question.metadata && (
        <div className="p-3 bg-[#2A2A2A] rounded-lg">
          <div className="flex flex-wrap gap-1">
            {question.metadata.subject && (
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                {question.metadata.subject}
              </Badge>
            )}
            {question.metadata.grade?.map((grade, i) => (
              <Badge key={i} variant="secondary" className="bg-green-600 text-white text-xs">
                {grade}
              </Badge>
            ))}
            {question.metadata.difficulty && (
              <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
                {question.metadata.difficulty}
              </Badge>
            )}
            {question.metadata.tags?.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="bg-purple-600 text-white text-xs">
                {tag}
              </Badge>
            ))}
            {question.metadata.tags && question.metadata.tags.length > 3 && (
              <Badge variant="secondary" className="bg-gray-600 text-white text-xs">
                +{question.metadata.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionHeader;
