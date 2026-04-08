import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  Edit,
  Copy
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';

const TestLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for tests
  const tests = [
    {
      id: 1,
      title: 'Biology Chapter 5: Photosynthesis',
      description: 'Comprehensive test covering light and dark reactions',
      subject: 'Biology',
      grade: '10th',
      duration: 60,
      questions: 25,
      difficulty: 'Medium',
      attempts: 127,
      averageScore: 78.5,
      lastUsed: '2024-01-15',
      tags: ['Photosynthesis', 'Plant Biology', 'IGCSE']
    },
    {
      id: 2,
      title: 'Chemistry: Chemical Bonding',
      description: 'Test on ionic, covalent, and metallic bonds',
      subject: 'Chemistry',
      grade: '11th',
      duration: 75,
      questions: 30,
      difficulty: 'Hard',
      attempts: 89,
      averageScore: 65.2,
      lastUsed: '2024-01-20',
      tags: ['Chemical Bonding', 'Ionic', 'Covalent']
    },
    {
      id: 3,
      title: 'Physics: Mechanics and Motion',
      description: 'Test covering Newton\'s laws and kinematics',
      subject: 'Physics',
      grade: '9th',
      duration: 50,
      questions: 20,
      difficulty: 'Easy',
      attempts: 155,
      averageScore: 85.0,
      lastUsed: '2024-01-22',
      tags: ['Mechanics', 'Motion', 'Newton\'s Laws']
    },
    {
      id: 4,
      title: 'Mathematics: Algebra II',
      description: 'Test on quadratic equations and polynomials',
      subject: 'Mathematics',
      grade: '12th',
      duration: 90,
      questions: 40,
      difficulty: 'Medium',
      attempts: 63,
      averageScore: 72.8,
      lastUsed: '2024-01-25',
      tags: ['Algebra', 'Quadratic Equations', 'Polynomials']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Dashboard" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage your test collection
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tests by title, subject, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-[#007AFF] hover:bg-[#0056CC]">
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold">{test.title}</CardTitle>
                <div className="space-x-1">
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{test.subject}</Badge>
                  <Badge variant="secondary">Grade {test.grade}</Badge>
                  {test.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                    {test.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                    {test.questions} questions
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-gray-400" />
                    {test.attempts} attempts
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-gray-400" />
                    {test.averageScore}% average
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

export default TestLibrary;
