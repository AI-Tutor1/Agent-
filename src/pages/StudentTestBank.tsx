
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Star,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/shared/BackButton';

const StudentTestBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  // Mock data for available tests
  const availableTests = [
    {
      id: 1,
      title: 'Biology Chapter 5: Photosynthesis',
      description: 'Test your understanding of photosynthesis processes',
      subject: 'Biology',
      duration: 60,
      questions: 25,
      difficulty: 'Medium',
      status: 'available',
      dueDate: '2024-02-01',
      attempts: 0,
      maxAttempts: 2
    },
    {
      id: 2,
      title: 'Chemistry: Chemical Reactions',
      description: 'Assess your knowledge of balancing equations',
      subject: 'Chemistry',
      duration: 45,
      questions: 20,
      difficulty: 'Hard',
      status: 'completed',
      dueDate: '2024-01-25',
      attempts: 1,
      maxAttempts: 1
    },
    {
      id: 3,
      title: 'Physics: Newton\'s Laws',
      description: 'Test on forces, motion, and energy',
      subject: 'Physics',
      duration: 50,
      questions: 15,
      difficulty: 'Easy',
      status: 'available',
      dueDate: '2024-02-10',
      attempts: 1,
      maxAttempts: 2
    },
    {
      id: 4,
      title: 'Mathematics: Algebra Basics',
      description: 'Fundamentals of algebraic expressions and equations',
      subject: 'Mathematics',
      duration: 40,
      questions: 18,
      difficulty: 'Medium',
      status: 'pending',
      dueDate: '2024-01-28',
      attempts: 0,
      maxAttempts: 1
    }
  ];

  const filteredTests = availableTests.filter(test => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      test.title.toLowerCase().includes(searchTermLower) ||
      test.subject.toLowerCase().includes(searchTermLower) ||
      test.description.toLowerCase().includes(searchTermLower);

    if (selectedFilter === 'all') {
      return matchesSearch;
    } else if (selectedFilter === 'available') {
      return matchesSearch && test.status === 'available';
    } else if (selectedFilter === 'completed') {
      return matchesSearch && test.status === 'completed';
    } else if (selectedFilter === 'pending') {
      return matchesSearch && test.status === 'pending';
    }

    return false;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default: return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStartTest = (testId: number) => {
    navigate(`/test-taking/${testId}`);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Dashboard" className="text-gray-300 hover:text-white hover:bg-gray-700" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Available Tests</h1>
          <p className="mt-1 text-sm text-gray-400">
            View and take your assigned tests
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="bg-[#2A2A2A] border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-[#38B6FF]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(test.status)}
                  <CardTitle className="text-white text-lg">{test.title}</CardTitle>
                </div>
                <Badge className={`${getDifficultyColor(test.difficulty)} text-white`}>
                  {test.difficulty}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">{test.description}</p>
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center text-gray-300">
                    <BookOpen className="mr-2 h-4 w-4 text-[#38B6FF]" />
                    {test.questions} Questions
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="mr-2 h-4 w-4 text-[#38B6FF]" />
                    {test.duration} Minutes
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  {test.status === 'available' && (
                    <Button 
                      className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white w-full sm:w-auto"
                      onClick={() => handleStartTest(test.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  )}
                  {test.status === 'pending' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      Due: {test.dueDate}
                    </Badge>
                  )}
                  {test.status === 'completed' && (
                    <Badge className="bg-blue-500 text-white">
                      Completed
                    </Badge>
                  )}
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{test.attempts}/{test.maxAttempts} Attempts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentTestBank;
