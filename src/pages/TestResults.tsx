
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  BarChart3,
  Download,
  Share2
} from 'lucide-react';

interface QuestionResult {
  id: string;
  question: string;
  type: 'mcq' | 'short-answer' | 'essay';
  userAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  marksAwarded: number;
  totalMarks: number;
  feedback?: string;
}

const TestResults = () => {
  const { testId } = useParams();

  const mockResult = {
    testId,
    testTitle: 'Photosynthesis and Plant Biology',
    subject: 'Biology',
    grade: '10th',
    completedAt: '2024-01-20T10:30:00Z',
    timeSpent: 85, // minutes
    totalTime: 90,
    score: 42,
    totalMarks: 50,
    percentage: 84,
    classAverage: 76.5,
    rank: 3,
    totalStudents: 45,
    questions: [
      {
        id: '1',
        question: 'What is the primary function of chlorophyll in photosynthesis?',
        type: 'mcq' as const,
        userAnswer: 'Absorbing light energy',
        correctAnswer: 'Absorbing light energy',
        isCorrect: true,
        marksAwarded: 2,
        totalMarks: 2,
        feedback: 'Excellent! Chlorophyll is indeed responsible for absorbing light energy during photosynthesis.'
      },
      {
        id: '2',
        question: 'Which organelle is responsible for photosynthesis in plant cells?',
        type: 'mcq' as const,
        userAnswer: 'Mitochondria',
        correctAnswer: 'Chloroplast',
        isCorrect: false,
        marksAwarded: 0,
        totalMarks: 2,
        feedback: 'Incorrect. Chloroplasts are the organelles responsible for photosynthesis, not mitochondria.'
      },
      {
        id: '3',
        question: 'Explain the difference between photosynthesis and cellular respiration.',
        type: 'short-answer' as const,
        userAnswer: 'Photosynthesis converts light energy into glucose using CO2 and water, while cellular respiration breaks down glucose to release energy in the form of ATP.',
        marksAwarded: 5,
        totalMarks: 6,
        feedback: 'Good understanding! Your answer shows clear knowledge of both processes. Could have mentioned that photosynthesis occurs in chloroplasts and respiration in mitochondria for full marks.'
      },
      {
        id: '4',
        question: 'Describe the light-dependent reactions of photosynthesis, including the role of chlorophyll, water, and ATP synthesis.',
        type: 'essay' as const,
        userAnswer: 'In light-dependent reactions, chlorophyll absorbs light energy which excites electrons. Water molecules are split to replace these electrons, releasing oxygen as a byproduct. The energy is used to create ATP through photophosphorylation and NADPH is also produced.',
        marksAwarded: 8,
        totalMarks: 10,
        feedback: 'Very good explanation of the light-dependent reactions. You correctly identified the key components and processes. Could have elaborated more on the electron transport chain and the specific location (thylakoids) for higher marks.'
      }
    ] as QuestionResult[]
  };

  const correctAnswers = mockResult.questions.filter(q => q.isCorrect).length;
  const mcqQuestions = mockResult.questions.filter(q => q.type === 'mcq');
  const mcqCorrect = mcqQuestions.filter(q => q.isCorrect).length;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link to="/student-test-bank">
                <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tests
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{mockResult.testTitle}</h1>
                <p className="text-gray-400">{mockResult.subject} • {mockResult.grade}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Score Card */}
          <Card className="bg-[#2A2A2A] border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${getGradeColor(mockResult.percentage)}`}>
                  {mockResult.percentage}%
                </div>
                <div className="text-2xl text-gray-300 mb-2">
                  {mockResult.score}/{mockResult.totalMarks} marks
                </div>
                <Badge className={`text-lg px-4 py-2 ${getGradeColor(mockResult.percentage)}`}>
                  Grade {getGradeLetter(mockResult.percentage)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{mockResult.rank}</div>
                  <div className="text-gray-400">Class Rank</div>
                  <div className="text-sm text-gray-500">out of {mockResult.totalStudents}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#38B6FF]">{mockResult.classAverage}%</div>
                  <div className="text-gray-400">Class Average</div>
                  <div className="text-sm text-gray-500">
                    {mockResult.percentage > mockResult.classAverage ? 'Above' : 'Below'} average
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-300">Correct Answers</span>
                </div>
                <span className="text-white font-semibold">
                  {correctAnswers}/{mockResult.questions.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-300">Time Spent</span>
                </div>
                <span className="text-white font-semibold">
                  {mockResult.timeSpent}/{mockResult.totalTime} min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-gray-300">MCQ Accuracy</span>
                </div>
                <span className="text-white font-semibold">
                  {mcqQuestions.length > 0 ? `${Math.round((mcqCorrect / mcqQuestions.length) * 100)}%` : 'N/A'}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-sm text-gray-400 mb-2">Time Efficiency</div>
                <Progress value={(mockResult.timeSpent / mockResult.totalTime) * 100} />
                <div className="text-xs text-gray-500 mt-1">
                  {mockResult.timeSpent < mockResult.totalTime ? 'Completed early' : 'Used full time'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question-by-Question Analysis */}
        <Card className="bg-[#2A2A2A] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockResult.questions.map((question, index) => (
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link to="/student-test-bank">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Back to Test Bank
            </Button>
          </Link>
          <Link to={`/test-performance/${testId}/student/student-123`}>
            <Button className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white">
              <Target className="mr-2 h-4 w-4" />
              Detailed Performance Analysis
            </Button>
          </Link>
          <Link to="/performance-trends/student-123">
            <Button variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Long-term Trends
            </Button>
          </Link>
          <Link to={`/test-performance/${testId}/teacher`}>
            <Button variant="outline" className="border-yellow-600 text-yellow-300 hover:bg-yellow-700">
              <Award className="mr-2 h-4 w-4" />
              Teacher Analytics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
