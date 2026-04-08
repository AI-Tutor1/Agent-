
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnhancedQuestion } from '@/types/question';
import QuestionHeader from './QuestionHeader';
import QuestionForm from './QuestionForm';
import QuestionActions from './QuestionActions';

interface QuestionCardProps {
  question: EnhancedQuestion;
  previewMode: boolean;
  isSelected: boolean;
  onUpdate: (id: string, field: keyof EnhancedQuestion, value: any) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string | null) => void;
  onDuplicate?: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  previewMode,
  isSelected,
  onUpdate,
  onRemove,
  onSelect,
  onDuplicate
}) => {
  const handlePreview = (id: string) => {
    onSelect(id);
    // Additional preview logic can be added here
  };

  return (
    <Card className={`bg-[#1E1E1E] border-gray-700 ${isSelected ? 'ring-2 ring-[#38B6FF]' : ''}`}>
      <CardHeader className="pb-4">
        <QuestionHeader
          question={question}
          onUpdate={(field, value) => onUpdate(question.id, field, value)}
          onRemove={() => onRemove(question.id)}
          onOpenAssociation={() => onSelect(question.id)}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {!previewMode ? (
          <QuestionForm
            question={question}
            onUpdate={(field, value) => onUpdate(question.id, field, value)}
          />
        ) : (
          <div className="text-gray-300">
            <p className="mb-4">{question.text || 'Question text not set'}</p>
            {question.mcqOptions && question.mcqOptions.length > 0 && (
              <div className="space-y-2">
                {question.mcqOptions.map((option, index) => (
                  <div 
                    key={option.id} 
                    className={`p-2 rounded ${option.isCorrect ? 'bg-green-600/20' : 'bg-gray-700'}`}
                  >
                    {String.fromCharCode(65 + index)}. {option.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <QuestionActions
          question={question}
          onUpdate={(field, value) => onUpdate(question.id, field, value)}
          onDuplicate={onDuplicate}
          onPreview={handlePreview}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
