
import { useState, useCallback } from 'react';
import { EnhancedQuestion } from '@/types/question';

export const useQuestionBuilder = (initialQuestions: EnhancedQuestion[] = []) => {
  const [questions, setQuestions] = useState<EnhancedQuestion[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = useCallback(() => {
    const questionCount = questions.filter(q => q.type === 'question').length;
    const newQuestion: EnhancedQuestion = {
      id: Date.now().toString(),
      questionNumber: questionCount + 1,
      type: 'question',
      subType: 'mcq',
      text: '',
      marks: 1,
      includeAnswer: false,
      includeDiagram: false,
      mcqOptions: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ],
      createdAt: new Date().toISOString(),
      version: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  }, [questions]);

  const updateQuestion = useCallback((id: string, field: keyof EnhancedQuestion, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value, updatedAt: new Date().toISOString() } : q
    ));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const duplicatedQuestion: EnhancedQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        questionNumber: questions.filter(q => q.type === 'question').length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
      setQuestions(prev => [...prev, duplicatedQuestion]);
    }
  }, [questions]);

  const togglePreviewMode = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  return {
    questions,
    selectedQuestionId,
    previewMode,
    setQuestions,
    setSelectedQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicateQuestion,
    togglePreviewMode
  };
};
