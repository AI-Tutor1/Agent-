
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast"
import BackButton from '@/components/shared/BackButton';

const TestTaking = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [test, setTest] = useState<{
    id: number;
    title: string;
    questions: {
      id: number;
      text: string;
      options?: string[];
    }[];
  } | null>(null);

  useEffect(() => {
    // Mock test data
    const mockTest = {
      id: 1,
      title: 'Sample Test',
      questions: [
        { id: 1, text: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Rome'] },
        { id: 2, text: 'What is 2 + 2?' },
        { id: 3, text: 'What is the largest planet in our solar system?', options: ['Earth', 'Jupiter', 'Mars', 'Venus'] },
      ],
    };

    // Simulate fetching test data
    setTimeout(() => {
      setTest(mockTest);
    }, 500);
  }, [testId]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (test?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    // Process and submit answers
    console.log('Answers:', answers);
    toast({
      title: "Test Submitted",
      description: "Your test has been submitted successfully.",
    })
    navigate('/student-test-bank');
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white text-lg">Loading test...</div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <BackButton to="/student-test-bank" label="Back to Tests" className="text-gray-300 hover:text-white hover:bg-gray-700" />
        
        {/* Test Header */}
        <Card className="bg-[#2A2A2A] border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">{test.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
          </CardContent>
        </Card>

        {/* Question Display */}
        <Card className="bg-[#2A2A2A] border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Question {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-300">{currentQuestion.text}</p>
            {currentQuestion.options ? (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`question-${currentQuestion.id}-option-${index}`}
                      checked={answers[currentQuestionIndex] === option}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleAnswerChange(currentQuestionIndex, option);
                        } else {
                          handleAnswerChange(currentQuestionIndex, '');
                        }
                      }}
                    />
                    <Label htmlFor={`question-${currentQuestion.id}-option-${index}`} className="text-gray-300">{option}</Label>
                  </div>
                ))}
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Your answer"
                value={answers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                className="bg-[#1A1A1A] border-gray-600 text-white placeholder-gray-400"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="bg-[#2A2A2A] border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </Button>
              {currentQuestionIndex === test.questions.length - 1 ? (
                <Button 
                  onClick={handleSubmitTest}
                  className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
                >
                  Submit Test
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestTaking;
