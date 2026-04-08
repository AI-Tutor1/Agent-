
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Target, BarChart3 } from 'lucide-react';
import PerformanceSummaryCard from '@/components/dashboard/PerformanceSummaryCard';
import StrengthsWeaknessesCard from '@/components/dashboard/StrengthsWeaknessesCard';
import QuestionAnalysisCard from '@/components/dashboard/QuestionAnalysisCard';
import StatCard from '@/components/shared/StatCard';
import ActionButtonGroup from '@/components/shared/ActionButtonGroup';
import { formatTime } from '@/utils/performanceCalculations';
import { Users, Clock, Target as TargetIcon, CheckCircle } from 'lucide-react';

const StudentTestDashboard = () => {
  const { testId, studentId } = useParams();

  // Mock data - replace with actual API calls
  const mockData = {
    student: {
      name: 'Alex Rodriguez',
      id: studentId,
      email: 'alex.rodriguez@school.edu'
    },
    test: {
      title: 'Photosynthesis and Plant Biology',
      subject: 'Biology',
      grade: '10th',
      totalMarks: 50,
      duration: 90
    },
    performance: {
      score: 42,
      percentage: 84,
      timeSpent: 78,
      rank: 3,
      totalStudents: 45,
      classAverage: 76.5,
      correctAnswers: 18,
      totalQuestions: 20
    },
    strengths: [
      {
        topic: 'Chlorophyll Functions',
        score: 95,
        description: 'Excellent understanding of chlorophyll role in photosynthesis'
      },
      {
        topic: 'Light Reactions',
        score: 88,
        description: 'Strong grasp of light-dependent reactions and ATP synthesis'
      }
    ],
    weaknesses: [
      {
        topic: 'Calvin Cycle',
        score: 45,
        description: 'Struggled with the details of carbon fixation process',
        improvement: 'Review the three phases of Calvin cycle with visual diagrams'
      },
      {
        topic: 'Cellular Respiration',
        score: 52,
        description: 'Confusion between photosynthesis and cellular respiration',
        improvement: 'Create comparison charts to distinguish these processes'
      }
    ],
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
        timeSpent: 45,
        feedback: 'Excellent! Chlorophyll is indeed responsible for absorbing light energy.',
        improvementTip: 'Keep up the good work understanding pigment functions!'
      },
      {
        id: '2',
        question: 'Explain the Calvin cycle and its role in photosynthesis.',
        type: 'essay' as const,
        userAnswer: 'The Calvin cycle uses CO2 to make glucose using energy from light reactions.',
        marksAwarded: 3,
        totalMarks: 8,
        timeSpent: 280,
        feedback: 'Basic understanding shown but lacks detail on the three phases.',
        improvementTip: 'Study the three phases: carbon fixation, reduction, and regeneration in detail.'
      }
    ]
  };

  const actionButtons = [
    {
      label: 'Back to Results',
      icon: ArrowLeft,
      onClick: () => window.history.back(),
      variant: 'outline' as const,
      className: 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'
    },
    {
      label: 'Study Plan',
      icon: BookOpen,
      onClick: () => console.log('Generate study plan'),
      className: 'bg-[#38B6FF] hover:bg-[#2A9DE8] text-white border-0'
    },
    {
      label: 'Practice Similar',
      icon: Target,
      onClick: () => console.log('Find practice questions'),
      variant: 'outline' as const,
      className: 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'
    },
    {
      label: 'Performance Trends',
      icon: BarChart3,
      onClick: () => console.log('View trends'),
      variant: 'outline' as const,
      className: 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Link to={`/test-results/${testId}`}>
                <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Performance Analysis</h1>
                <p className="text-gray-400">{mockData.test.title} • {mockData.student.name}</p>
              </div>
            </div>
            <Badge className="bg-[#38B6FF] text-white">
              Detailed Analysis
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <PerformanceSummaryCard
            score={mockData.performance.score}
            totalMarks={mockData.test.totalMarks}
            percentage={mockData.performance.percentage}
            rank={mockData.performance.rank}
            totalStudents={mockData.performance.totalStudents}
            classAverage={mockData.performance.classAverage}
          />
          
          <div className="space-y-4">
            <StatCard
              title="Correct Answers"
              value={`${mockData.performance.correctAnswers}/${mockData.performance.totalQuestions}`}
              icon={CheckCircle}
              iconColor="text-green-400"
            />
            <StatCard
              title="Time Spent"
              value={formatTime(mockData.performance.timeSpent)}
              icon={Clock}
              iconColor="text-blue-400"
              description={`of ${formatTime(mockData.test.duration)} total`}
            />
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="mb-8">
          <StrengthsWeaknessesCard
            strengths={mockData.strengths}
            weaknesses={mockData.weaknesses}
          />
        </div>

        {/* Question Analysis */}
        <div className="mb-8">
          <QuestionAnalysisCard questions={mockData.questions} />
        </div>

        {/* Action Buttons */}
        <ActionButtonGroup buttons={actionButtons} className="mt-8" />
      </div>
    </div>
  );
};

export default StudentTestDashboard;
