
import React from 'react';
import Navigation from '@/components/Navigation';
import QuestionBuilder from '@/components/QuestionBuilder';
import BackButton from '@/components/shared/BackButton';

const QuestionBank = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/questions" label="Back to Question Bank" />
        <QuestionBuilder />
      </div>
    </div>
  );
};

export default QuestionBank;
