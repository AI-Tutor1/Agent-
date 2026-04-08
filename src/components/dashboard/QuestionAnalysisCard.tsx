
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuestionResult {
  id: string;
  question: string;
  type: 'mcq' | 'short-answer' | 'essay';
  userAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  marksAwarded: number;
  totalMarks: number;
  timeSpent: number;
  feedback?: string;
  improvementTip?: string;
}

interface QuestionAnalysisProps {
  questions: QuestionResult[];
}

const QuestionAnalysisCard: React.FC<QuestionAnalysisProps> = ({ questions }) => {
  return (
    <Card className="bg-[#2A2A2A] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Detailed Question Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-600 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="border-[#38B6FF] text-[#38B6FF]">
                      Question {index + 1}
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                      {question.type.replace('-', ' ')}
                    </Badge>
                    <Badge 
                      className={question.isCorrect !== false 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                      }
                    >
                      {question.marksAwarded}/{question.totalMarks} marks
                    </Badge>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {question.timeSpent}s
                    </div>
                  </div>
                  <p className="text-white text-lg mb-3">{question.question}</p>
                </div>
                {question.isCorrect !== undefined && (
                  question.isCorrect ? (
                    <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                  )
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Your Answer:</div>
                  <div className="text-white bg-[#1E1E1E] p-3 rounded border-l-4 border-blue-500">
                    {question.userAnswer}
                  </div>
                </div>

                {question.correctAnswer && question.type === 'mcq' && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Correct Answer:</div>
                    <div className="text-white bg-[#1E1E1E] p-3 rounded border-l-4 border-green-500">
                      {question.correctAnswer}
                    </div>
                  </div>
                )}

                {question.feedback && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Feedback:</div>
                    <div className="text-gray-300 bg-[#1E1E1E] p-3 rounded border-l-4 border-yellow-500">
                      {question.feedback}
                    </div>
                  </div>
                )}

                {question.improvementTip && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">How to Improve:</div>
                    <div className="text-purple-300 bg-[#1E1E1E] p-3 rounded border-l-4 border-purple-500">
                      {question.improvementTip}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionAnalysisCard;
