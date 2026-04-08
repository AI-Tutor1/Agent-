
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  FileText,
  BookOpen
} from 'lucide-react';
import QuestionEditor from './QuestionEditor';

interface Question {
  id: string;
  type: 'mcq' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  marks: number;
}

interface QuestionsListProps {
  questions?: Question[];
  editingQuestionId: string | null;
  onAddQuestion: () => void;
  onEditQuestion: (questionId: string | null) => void;
  onUpdateQuestion: (questionId: string, updatedQuestion: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onOpenOCR: (questionId: string, field: 'question' | 'option', optionIndex?: number) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions = [],
  editingQuestionId,
  onAddQuestion,
  onEditQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onOpenOCR
}) => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'short-answer': return <Edit className="h-4 w-4 text-green-500" />;
      case 'essay': return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">Questions ({questions.length})</h3>
        <Button
          onClick={onAddQuestion}
          className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="bg-[#1E1E1E] border-gray-600">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No questions yet</p>
              <p className="text-sm">Start building your test by adding questions</p>
            </div>
            <Button
              onClick={onAddQuestion}
              className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id} className="bg-[#1E1E1E] border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getQuestionTypeIcon(question.type)}
                    <span className="text-white font-medium">Question {index + 1}</span>
                    <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                      {question.marks} marks
                    </Badge>
                    <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs capitalize">
                      {question.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditQuestion(
                        editingQuestionId === question.id ? null : question.id
                      )}
                      className="text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateQuestion(question.id)}
                      className="text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingQuestionId === question.id ? (
                  <QuestionEditor
                    question={question}
                    onUpdate={onUpdateQuestion}
                    onOpenOCR={onOpenOCR}
                  />
                ) : (
                  <div className="text-gray-300 text-sm">
                    {question.question}
                    {question.type === 'mcq' && question.options && (
                      <div className="mt-2 ml-4">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-gray-400 text-xs">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
