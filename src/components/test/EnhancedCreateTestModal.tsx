
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Target,
  Plus,
  X,
  Lightbulb,
  CheckSquare,
  FileText,
  Calculator,
  Image as ImageIcon,
  Filter,
  Search,
  TrendingUp,
  Brain,
  Star,
  Zap
} from 'lucide-react';
import { EnhancedQuestion } from '@/types/question';

interface EnhancedCreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedCreateTestModal: React.FC<EnhancedCreateTestModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    curriculum: '',
    level: '',
    board: '',
    topics: [] as string[],
    duration: 60,
    totalMarks: 100,
    instructions: '',
    passingMarks: 40,
    difficultyDistribution: {
      easy: 40,
      medium: 40,
      hard: 20
    }
  });

  const [questionFilters, setQuestionFilters] = useState({
    difficulty: [] as string[],
    questionType: [] as string[],
    bloomsLevel: [] as string[],
    marks: [1, 10] as [number, number],
    estimatedTime: [30, 300] as [number, number]
  });

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  // Enhanced suggested questions with more metadata
  const suggestedQuestions: EnhancedQuestion[] = [
    {
      id: 'suggested-1',
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
        year: [2023],
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
      id: 'suggested-2',
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
      subparts: [
        {
          id: 'a',
          partNumber: 'a',
          text: 'Identify three environmental factors that affect photosynthesis',
          marks: 3,
          subType: 'short'
        },
        {
          id: 'b',
          partNumber: 'b',
          text: 'Explain how each factor affects the process',
          marks: 3,
          subType: 'short'
        }
      ],
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
      id: 'suggested-3',
      questionNumber: 3,
      type: 'question',
      subType: 'numerical',
      text: 'A student investigates the effect of light intensity on photosynthesis rate. Calculate the rate of oxygen production from the given data.',
      marks: 8,
      includeAnswer: true,
      includeDiagram: true,
      totalAttempts: 156,
      averageScore: 58.4,
      averageTime: 420,
      skipRate: 25.6,
      hintUsage: 61.5,
      successRate: 42.3,
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

  const addTopic = () => {
    if (newTopic.trim() && !testData.topics.includes(newTopic.trim())) {
      setTestData({
        ...testData,
        topics: [...testData.topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTestData({
      ...testData,
      topics: testData.topics.filter(topic => topic !== topicToRemove)
    });
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

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

  const steps = [
    { id: 1, title: 'Test Configuration', icon: BookOpen },
    { id: 2, title: 'Smart Question Selection', icon: Brain },
    { id: 3, title: 'Quality Assurance', icon: Target },
    { id: 4, title: 'Final Review', icon: CheckSquare }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Smart Test</DialogTitle>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep >= step.id ? 'bg-[#007AFF] text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${activeStep >= step.id ? 'text-[#007AFF]' : 'text-gray-500'}`}>
                  Step {step.id}
                </div>
                <div className={`text-xs ${activeStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px ml-4 ${activeStep > step.id ? 'bg-[#007AFF]' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Test Configuration */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block font-medium">Test Title *</Label>
                <Input
                  value={testData.title}
                  onChange={(e) => setTestData({...testData, title: e.target.value})}
                  placeholder="Enter test title"
                />
              </div>
              <div>
                <Label className="mb-2 block font-medium">Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={testData.duration}
                  onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block font-medium">Description</Label>
              <Textarea
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
                placeholder="Brief description of the test"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label className="mb-2 block font-medium">Subject *</Label>
                <Select value={testData.subject} onValueChange={(value) => setTestData({...testData, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block font-medium">Grade *</Label>
                <Select value={testData.grade} onValueChange={(value) => setTestData({...testData, grade: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block font-medium">Curriculum *</Label>
                <Select value={testData.curriculum} onValueChange={(value) => setTestData({...testData, curriculum: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="a-level">A-Level</SelectItem>
                    <SelectItem value="gcse">GCSE</SelectItem>
                    <SelectItem value="o-level">O-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block font-medium">Level *</Label>
                <Select value={testData.level} onValueChange={(value) => setTestData({...testData, level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="gcse">GCSE</SelectItem>
                    <SelectItem value="a-level">A-Level</SelectItem>
                    <SelectItem value="o-level">O-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topics Section */}
            <div>
              <Label className="mb-2 block font-medium">Topics *</Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Add a topic (e.g., Photosynthesis, Cell Division)"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                />
                <Button type="button" onClick={addTopic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {testData.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#007AFF] text-white">
                    {topic}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div>
              <Label className="mb-3 block font-medium">Question Difficulty Distribution</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Easy ({testData.difficultyDistribution.easy}%)</Label>
                  <Slider
                    value={[testData.difficultyDistribution.easy]}
                    onValueChange={(value) => setTestData({
                      ...testData,
                      difficultyDistribution: { ...testData.difficultyDistribution, easy: value[0] }
                    })}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Medium ({testData.difficultyDistribution.medium}%)</Label>
                  <Slider
                    value={[testData.difficultyDistribution.medium]}
                    onValueChange={(value) => setTestData({
                      ...testData,
                      difficultyDistribution: { ...testData.difficultyDistribution, medium: value[0] }
                    })}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Hard ({testData.difficultyDistribution.hard}%)</Label>
                  <Slider
                    value={[testData.difficultyDistribution.hard]}
                    onValueChange={(value) => setTestData({
                      ...testData,
                      difficultyDistribution: { ...testData.difficultyDistribution, hard: value[0] }
                    })}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setActiveStep(2)}
                className="bg-[#007AFF] hover:bg-[#0056CC]"
                disabled={!testData.title || !testData.subject || !testData.grade || !testData.curriculum || testData.topics.length === 0}
              >
                Next: Smart Selection
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Smart Question Selection */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-[#007AFF]" />
                  AI-Powered Question Recommendations
                </CardTitle>
                <p className="text-gray-600">
                  Based on: {testData.topics.join(', ')} • {testData.grade} • {testData.curriculum}
                </p>
              </CardHeader>
              <CardContent>
                {/* Question Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Filter className="mr-2 h-4 w-4" />
                    <span className="font-medium">Refine Suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm mb-1 block">Question Types</Label>
                      <div className="space-y-2">
                        {['MCQ', 'Short Answer', 'Long Answer', 'Numerical'].map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={type} />
                            <Label htmlFor={type} className="text-sm">{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">Bloom's Levels</Label>
                      <div className="space-y-2">
                        {['Remember', 'Understand', 'Apply', 'Analyze'].map(level => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox id={level} />
                            <Label htmlFor={level} className="text-sm">{level}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">Performance Filter</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All questions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High performing ({'>'}80%)</SelectItem>
                          <SelectItem value="medium">Medium performing (60-80%)</SelectItem>
                          <SelectItem value="low">Needs improvement ({'<'}60%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {suggestedQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleQuestionToggle(question.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
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
                              <Badge variant="outline" className="text-xs">
                                {question.metadata?.bloomsLevel}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                <span className={getPerformanceColor(question.averageScore || 0)}>
                                  {question.averageScore?.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                {question.totalAttempts}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {question.averageTime}s
                              </div>
                            </div>
                          </div>
                          
                          <p className="mb-2">{question.text}</p>
                          
                          {question.subparts && (
                            <div className="ml-4 space-y-1 mb-2">
                              {question.subparts.map((subpart) => (
                                <div key={subpart.id} className="text-sm text-gray-600">
                                  ({subpart.partNumber}) {subpart.text} [{subpart.marks} marks]
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {question.metadata?.tags?.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {question.metadata?.difficultyIndex && question.metadata.difficultyIndex > 0.7 && (
                                <div className="flex items-center text-green-600 text-xs">
                                  <Star className="mr-1 h-3 w-3" />
                                  High Quality
                                </div>
                              )}
                              {question.successRate && question.successRate > 70 && (
                                <div className="flex items-center text-blue-600 text-xs">
                                  <Zap className="mr-1 h-3 w-3" />
                                  Proven
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <div className="space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setActiveStep(3)}
                >
                  Skip Suggestions
                </Button>
                <Button 
                  onClick={() => setActiveStep(3)}
                  className="bg-[#007AFF] hover:bg-[#0056CC]"
                  disabled={selectedQuestions.length === 0}
                >
                  Add Selected ({selectedQuestions.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Quality Assurance */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Quality Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedQuestions.length}</div>
                    <div className="text-sm text-gray-600">Questions Selected</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedQuestions.length * 4}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Marks</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{testData.duration}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">B+</div>
                    <div className="text-sm text-gray-600">Quality Grade</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Quality Indicators</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Good difficulty distribution across levels</li>
                      <li>• Diverse question types for comprehensive assessment</li>
                      <li>• High-performing questions with proven reliability</li>
                      <li>• Appropriate time allocation per question</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Optimization Suggestions</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Consider adding one more 'Apply' level question</li>
                      <li>• Balance of MCQ and written questions looks good</li>
                      <li>• Time allocation allows for thorough responses</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(2)}
              >
                Back to Selection
              </Button>
              <Button 
                onClick={() => setActiveStep(4)}
                className="bg-[#007AFF] hover:bg-[#0056CC]"
              >
                Proceed to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Final Review */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007AFF]">{selectedQuestions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007AFF]">
                      {selectedQuestions.length * 4}
                    </div>
                    <div className="text-sm text-gray-600">Total Marks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007AFF]">{testData.duration}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007AFF]">{testData.topics.length}</div>
                    <div className="text-sm text-gray-600">Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#007AFF]">A</div>
                    <div className="text-sm text-gray-600">Quality Grade</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Test Configuration</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Title:</span> {testData.title}</div>
                    <div><span className="font-medium">Subject:</span> {testData.subject}</div>
                    <div><span className="font-medium">Grade:</span> {testData.grade}</div>
                    <div><span className="font-medium">Curriculum:</span> {testData.curriculum}</div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Topics:</span> {testData.topics.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(3)}
              >
                Back to Quality Check
              </Button>
              <div className="space-x-3">
                <Button variant="outline">
                  Save as Draft
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-[#007AFF] hover:bg-[#0056CC]"
                >
                  Publish Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateTestModal;
