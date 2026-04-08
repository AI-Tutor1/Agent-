
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import Navigation from '@/components/Navigation';

interface StudentTest {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  questionCount: number;
  totalMarks: number;
  instructor: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent?: number;
}

const StudentTests = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const mockTests: StudentTest[] = [
    {
      id: '1',
      title: 'Photosynthesis and Plant Biology',
      subject: 'Biology',
      grade: '10th',
      duration: 90,
      questionCount: 25,
      totalMarks: 50,
      instructor: 'Dr. Sarah Johnson',
      dueDate: '2024-02-15',
      status: 'not-started'
    },
    {
      id: '2',
      title: 'Algebraic Equations Fundamentals',
      subject: 'Mathematics',
      grade: '9th',
      duration: 60,
      questionCount: 18,
      totalMarks: 40,
      instructor: 'Prof. Michael Chen',
      dueDate: '2024-02-12',
      status: 'in-progress',
      timeSpent: 35
    },
    {
      id: '3',
      title: 'Chemical Reactions and Stoichiometry',
      subject: 'Chemistry',
      grade: '11th',
      duration: 120,
      questionCount: 30,
      totalMarks: 75,
      instructor: 'Dr. Emma Wilson',
      dueDate: '2024-02-10',
      status: 'completed',
      score: 68,
      timeSpent: 105
    }
  ];

  const filteredTests = mockTests.filter(test => {
    if (filter === 'pending') return test.status !== 'completed';
    if (filter === 'completed') return test.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tests</h1>
          <p className="text-gray-400">View and take your assigned assessments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'all', label: 'All Tests' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "ghost"}
              onClick={() => setFilter(tab.key as any)}
              className={filter === tab.key 
                ? "bg-[#38B6FF] text-white" 
                : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="bg-[#2A2A2A] border-gray-700 hover:border-[#38B6FF] transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                      {test.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{test.subject}</span>
                      <span>•</span>
                      <span>{test.grade}</span>
                    </div>
                  </div>
                  <Badge 
                    className={`${getStatusColor(test.status)} text-white flex items-center space-x-1`}
                  >
                    {getStatusIcon(test.status)}
                    <span className="capitalize">
                      {test.status.replace('-', ' ')}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Test Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Clock className="mr-2 h-4 w-4" />
                    {test.duration} mins
                  </div>
                  <div className="flex items-center text-gray-400">
                    <FileText className="mr-2 h-4 w-4" />
                    {test.questionCount} questions
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="mr-2 h-4 w-4" />
                    {test.instructor}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    Due: {new Date(test.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Progress for in-progress tests */}
                {test.status === 'in-progress' && test.timeSpent && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">
                        {test.timeSpent}/{test.duration} mins
                      </span>
                    </div>
                    <Progress value={(test.timeSpent / test.duration) * 100} />
                  </div>
                )}

                {/* Score for completed tests */}
                {test.status === 'completed' && test.score && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Your Score</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#38B6FF]">
                          {test.score}/{test.totalMarks}
                        </div>
                        <div className="text-sm text-gray-400">
                          {Math.round((test.score / test.totalMarks) * 100)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={(test.score / test.totalMarks) * 100} />
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {test.status === 'not-started' && (
                    <Button className="w-full bg-[#38B6FF] hover:bg-[#2A9DE8] text-white">
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  )}
                  {test.status === 'in-progress' && (
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Continue Test
                    </Button>
                  )}
                  {test.status === 'completed' && (
                    <Button variant="outline" className="w-full border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                No tests found
              </h3>
              <p className="text-gray-400">
                {filter === 'completed' 
                  ? "You haven't completed any tests yet." 
                  : filter === 'pending'
                  ? "All caught up! No pending tests."
                  : "No tests have been assigned to you yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentTests;
