
import React from 'react';
import { EnhancedQuestion } from '@/types/question';
import QuestionBuilderCore from './QuestionBuilderCore';

interface QuestionBuilderProps {
  questions: EnhancedQuestion[];
  onQuestionsChange: (questions: EnhancedQuestion[]) => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ questions, onQuestionsChange }) => {
  return <QuestionBuilderCore questions={questions} onQuestionsChange={onQuestionsChange} />;
};

export default QuestionBuilder;
