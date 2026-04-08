
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackButton from '@/components/shared/BackButton';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  BarChart3,
  Download,
  Upload,
  Star,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
  Calculator,
  Image as ImageIcon,
  Brain,
  Target
} from 'lucide-react';
import { EnhancedQuestion } from '@/types/question';

const EnhancedQuestionBank: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    subjects: [] as string[],
    grades: [] as string[],
    curricula: [] as string[],
    difficulties: [] as string[],
    questionTypes: [] as string[],
    topics: [] as string[],
    boards: [] as string[],
    years: [] as string[],
    bloomsLevels: [] as string[]
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Mock questions data with enhanced metadata
  const questions: EnhancedQuestion[] = [
    {
      id: '1',
      questionNumber: 1,
      type: 'question',
      subType: 'mcq',
      text: 'What is the primary function of chlorophyll in photosynthesis?',
      marks: 2,
      includeAnswer: true,
      includeDiagram: false,
      totalAttempts: 247,
      averageScore: 73.2,
      averageTime: 142,
      skipRate: 12.6,
      hintUsage: 34.8,
      successRate: 68.4,
      viewCount: 1250,
      completionRate: 87.4,
      mcqOptions: [
        { id: '1', text: 'Absorbing light energy', isCorrect: true },
        { id: '2', text: 'Storing glucose', isCorrect: false },
        { id: '3', text: 'Producing oxygen', isCorrect: false },
        { id: '4', text: 'Breaking down water', isCorrect: false }
      ],
      metadata: {
        topic: ['Photosynthesis', 'Plant Biology'],
        subject: 'Biology',
        grade: ['9th', '10th'],
        curriculum: ['IGCSE'],
        level: ['IGCSE'],
        board: ['Cambridge'],
        difficulty: 'Easy',
        year: [2023, 2022],
        paperType: ['Theory'],
        paperCode: ['0610/11'],
        attempt: [1],
        syllabusCode: ['0610'],
        syllabusType: ['Core'],
        variant: [1],
        marks: 2,
        estimatedTime: 60,
        tags: ['chlorophyll', 'photosynthesis', 'light'],
        learningObjectives: ['Understand photosynthesis process'],
        difficultyIndex: 0.73,
        discriminationIndex: 0.45,
        bloomsLevel: 'Remember'
      }
    },
    {
      id: '2',
      questionNumber: 2,
      type: 'question',
      subType: 'short',
      text: 'Explain how environmental factors affect the rate of photosynthesis.',
      marks: 6,
      includeAnswer: true,
      includeDiagram: false,
      totalAttempts: 189,
      averageScore: 65.8,
      averageTime: 240,
      skipRate: 18.2,
      hintUsage: 42.1,
      successRate: 58.7,
      viewCount: 890,
      completionRate: 81.8,
      metadata: {
        topic: ['Photosynthesis', 'Environmental Factors'],
        subject: 'Biology',
        grade: ['10th', '11th'],
        curriculum: ['IGCSE'],
        level: ['IGCSE'],
        board: ['Cambridge'],
        difficulty: 'Medium',
        year: [2023],
        paperType: ['Theory'],
        paperCode: ['0610/12'],
        attempt: [1],
        syllabusCode: ['0610'],
        syllabusType: ['Extended'],
        variant: [2],
        marks: 6,
        estimatedTime: 240,
        tags: ['environmental factors', 'limiting factors'],
        learningObjectives: ['Analyze environmental effects'],
        difficultyIndex: 0.66,
        discriminationIndex: 0.52,
        bloomsLevel: 'Understand'
      }
    },
    {
      id: '3',
      questionNumber: 3,
      type: 'question',
      subType: 'numerical',
      text: 'Calculate the rate of oxygen production in photosynthesis given the experimental data.',
      marks: 8,
      includeAnswer: true,
      includeDiagram: true,
      totalAttempts: 156,
      averageScore: 58.4,
      averageTime: 420,
      skipRate: 25.6,
      hintUsage: 61.5,
      successRate: 42.3,
      viewCount: 623,
      completionRate: 74.4,
      metadata: {
        topic: ['Photosynthesis', 'Experimental Design'],
        subject: 'Biology',
        grade: ['11th', '12th'],
        curriculum: ['IGCSE', 'A-Level'],
        level: ['IGCSE'],
        board: ['Cambridge'],
        difficulty: 'Hard',
        year: [2023],
        paperType: ['Practical'],
        paperCode: ['0610/31'],
        attempt: [1],
        syllabusCode: ['0610'],
        syllabusType: ['Extended'],
        variant: [3],
        marks: 8,
        estimatedTime: 420,
        tags: ['calculation', 'practical', 'data analysis'],
        learningObjectives: ['Apply mathematical skills'],
        difficultyIndex: 0.42,
        discriminationIndex: 0.38,
        bloomsLevel: 'Apply'
      }
    }
  ];

  const getQuestionTypeIcon = (subType?: string) => {
    switch (subType) {
      case 'mcq': return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'short': return <FileText className="h-4 w-4 text-green-500" />;
      case 'long': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'numerical': return <Calculator className="h-4 w-4 text-orange-500" />;
      case 'diagram': return <ImageIcon className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      case 'Pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Dashboard" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Question Bank</h1>
          <p className="mt-1 text-sm text-gray-500">
            Advanced question management with smart analytics
          </p>
          <div className="flex space-x-3 mt-4">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="bg-[#007AFF] hover:bg-[#0056CC]">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-sm border h-fit">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="sm">Reset</Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Search Questions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by content, topic, or metadata..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Subject Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Subject</Label>
                <div className="space-y-2">
                  {['Biology', 'Chemistry', 'Physics', 'Mathematics'].map(subject => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox id={subject} />
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Grade</Label>
                <div className="space-y-2">
                  {['9th', '10th', '11th', '12th'].map(grade => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox id={grade} />
                      <Label htmlFor={grade} className="text-sm">{grade}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Curriculum</Label>
                <div className="space-y-2">
                  {['IGCSE', 'A-Level', 'GCSE', 'O-Level'].map(curriculum => (
                    <div key={curriculum} className="flex items-center space-x-2">
                      <Checkbox id={curriculum} />
                      <Label htmlFor={curriculum} className="text-sm">{curriculum}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
                <div className="space-y-2">
                  {['Easy', 'Medium', 'Hard', 'Expert', 'Pro'].map(difficulty => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox id={difficulty} />
                      <Label htmlFor={difficulty} className="text-sm">{difficulty}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Type Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Question Type</Label>
                <div className="space-y-2">
                  {['MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'Diagram'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={type} />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Board Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Board</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cambridge">Cambridge</SelectItem>
                    <SelectItem value="edexcel">Edexcel</SelectItem>
                    <SelectItem value="aqa">AQA</SelectItem>
                    <SelectItem value="ocr">OCR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {questions.length} questions found
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="performance">Best Performance</SelectItem>
                    <SelectItem value="attempts">Most Attempts</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Questions Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {questions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getQuestionTypeIcon(question.subType)}
                        <Badge variant="outline" className="text-xs">
                          {question.subType?.toUpperCase()}
                        </Badge>
                        <Badge className={getDifficultyColor(question.metadata?.difficulty)}>
                          {question.metadata?.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.marks} marks
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm mb-4 line-clamp-3">{question.text}</p>
                    
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getPerformanceColor(question.averageScore || 0)}`}>
                          {question.averageScore?.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {question.totalAttempts}
                        </div>
                        <div className="text-xs text-gray-500">Attempts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {question.averageTime}s
                        </div>
                        <div className="text-xs text-gray-500">Avg Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {question.successRate?.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Success</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subject:</span>
                        <span>{question.metadata?.subject}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Grade:</span>
                        <span>{question.metadata?.grade?.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Topics:</span>
                        <span className="text-right">{question.metadata?.topic?.slice(0, 2).join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Bloom's Level:</span>
                        <Badge variant="outline" className="text-xs">
                          {question.metadata?.bloomsLevel}
                        </Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.metadata?.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuestionBank;
