
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedQuestion } from '@/types/question';

interface TestOverviewSidebarProps {
  questions: EnhancedQuestion[];
}

const TestOverviewSidebar: React.FC<TestOverviewSidebarProps> = ({ questions }) => {
  const getQuestionCount = () => {
    return questions.filter(q => q.type === 'question').length;
  };

  const getTotalMarks = () => {
    return questions
      .filter(q => q.type === 'question')
      .reduce((total, q) => total + (q.marks || 0), 0);
  };

  return (
    <Card className="bg-[#1E1E1E] border-gray-700 sticky top-4">
      <CardHeader>
        <CardTitle className="text-white text-lg">Test Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#38B6FF]">{getQuestionCount()}</div>
            <div className="text-xs text-gray-400">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#38B6FF]">{getTotalMarks()}</div>
            <div className="text-xs text-gray-400">Total Marks</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl font-bold text-[#38B6FF]">
            {Math.ceil(getTotalMarks() * 1.5)} min
          </div>
          <div className="text-xs text-gray-400">Estimated Time</div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-2">Quick Navigation</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-2 rounded hover:bg-[#2A2A2A] cursor-pointer"
              >
                <span className="text-sm text-gray-300">
                  {question.type === 'question' ? `Q${question.questionNumber}` : question.type}
                </span>
                <div className="flex space-x-1">
                  {question.marks && (
                    <Badge variant="secondary" className="text-xs">
                      {question.marks}m
                    </Badge>
                  )}
                  {question.metadata && (
                    <Badge variant="secondary" className="text-xs bg-[#38B6FF]">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestOverviewSidebar;
