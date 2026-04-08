
import React from 'react';
import { EnhancedQuestion } from '@/types/question';
import { useQuestionBuilder } from '@/hooks/useQuestionBuilder';
import QuestionToolbar from './QuestionToolbar';
import QuestionCard from './QuestionCard';
import TestOverviewSidebar from './TestOverviewSidebar';
import EmptyState from '../shared/EmptyState';

interface QuestionBuilderCoreProps {
  questions: EnhancedQuestion[];
  onQuestionsChange: (questions: EnhancedQuestion[]) => void;
}

const QuestionBuilderCore: React.FC<QuestionBuilderCoreProps> = ({ 
  questions: initialQuestions, 
  onQuestionsChange 
}) => {
  const {
    questions,
    selectedQuestionId,
    previewMode,
    setSelectedQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicateQuestion,
    togglePreviewMode
  } = useQuestionBuilder(initialQuestions);

  // Sync changes back to parent
  React.useEffect(() => {
    onQuestionsChange(questions);
  }, [questions, onQuestionsChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <QuestionToolbar
          onAddQuestion={addQuestion}
          previewMode={previewMode}
          onTogglePreview={togglePreviewMode}
          questionCount={questions.length}
        />

        {questions.length === 0 ? (
          <EmptyState
            title="No questions yet"
            description="Start building your test by adding questions"
            actionLabel="Add First Question"
            onAction={addQuestion}
          />
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                previewMode={previewMode}
                isSelected={selectedQuestionId === question.id}
                onUpdate={updateQuestion}
                onRemove={removeQuestion}
                onSelect={setSelectedQuestionId}
                onDuplicate={duplicateQuestion}
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <TestOverviewSidebar questions={questions} />
      </div>
    </div>
  );
};

export default QuestionBuilderCore;
