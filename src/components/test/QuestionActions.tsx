
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EnhancedQuestion } from '@/types/question';

interface QuestionActionsProps {
  question: EnhancedQuestion;
  onUpdate: (field: keyof EnhancedQuestion, value: any) => void;
  onDuplicate?: (id: string) => void;
  onPreview?: (id: string) => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({ 
  question, 
  onUpdate, 
  onDuplicate,
  onPreview 
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <Label htmlFor="include-answer" className="text-gray-300">Include Answer Key</Label>
        <Switch
          id="include-answer"
          checked={question.includeAnswer}
          onCheckedChange={(checked) => onUpdate('includeAnswer', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="include-diagram" className="text-gray-300">Include Diagram Space</Label>
        <Switch
          id="include-diagram"
          checked={question.includeDiagram}
          onCheckedChange={(checked) => onUpdate('includeDiagram', checked)}
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={() => onDuplicate?.(question.id)}
        >
          Duplicate
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={() => onPreview?.(question.id)}
        >
          Preview
        </Button>
      </div>
    </div>
  );
};

export default QuestionActions;
