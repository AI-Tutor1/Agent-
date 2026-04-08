
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';

interface QuestionToolbarProps {
  onAddQuestion: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  questionCount: number;
}

const QuestionToolbar: React.FC<QuestionToolbarProps> = ({
  onAddQuestion,
  previewMode,
  onTogglePreview,
  questionCount
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold text-white">
        Questions ({questionCount})
      </h3>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="border-gray-600 text-gray-300"
        >
          <Eye className="mr-2 h-4 w-4" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </Button>
        <Button 
          onClick={onAddQuestion}
          className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionToolbar;
