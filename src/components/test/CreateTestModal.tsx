
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  Image as ImageIcon
} from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';
import { EnhancedQuestion } from '@/types/question';

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    curriculum: '',
    topics: [] as string[],
    duration: 60,
    totalMarks: 100,
    instructions: '',
    passingMarks: 40
  });
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [selectedSuggestedQuestions, setSelectedSuggestedQuestions] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  // Mock suggested questions based on selected topics
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
        difficulty: 'Foundation',
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
        learningObjectives: ['Understand photosynthesis process']
      }
    },
    {
      id: 'suggested-2',
      questionNumber: 2,
      type: 'question',
      subType: 'short',
      text: 'Explain the role of stomata in photosynthesis.',
      marks: 4,
      includeAnswer: true,
      includeDiagram: false,
      subparts: [
        {
          id: 'a',
          partNumber: 'a',
          text: 'Define stomata',
          marks: 1,
          subType: 'short'
        },
        {
          id: 'b',
          partNumber: 'b',
          text: 'Explain their role in gas exchange during photosynthesis',
          marks: 3,
          subType: 'short'
        }
      ],
      metadata: {
        topic: ['Photosynthesis', 'Plant Structure'],
        subject: 'Biology',
        grade: ['9th', '10th'],
        curriculum: ['IGCSE'],
        level: ['IGCSE'],
        board: ['Cambridge'],
        difficulty: 'Core',
        year: [2023],
        paperType: ['Theory'],
        paperCode: ['0610/12'],
        attempt: [1],
        syllabusCode: ['0610'],
        syllabusType: ['Extended'],
        variant: [2],
        marks: 4,
        estimatedTime: 240,
        tags: ['stomata', 'gas exchange', 'leaves'],
        learningObjectives: ['Understand plant structures']
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

  const handleSuggestedQuestionToggle = (questionId: string) => {
    setSelectedSuggestedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const addSuggestedQuestions = () => {
    const questionsToAdd = suggestedQuestions
      .filter(q => selectedSuggestedQuestions.includes(q.id))
      .map((q, index) => ({
        ...q,
        id: Date.now().toString() + index,
        questionNumber: questions.length + index + 1
      }));
    
    setQuestions([...questions, ...questionsToAdd]);
    setSelectedSuggestedQuestions([]);
    setActiveStep(3);
  };

  const getQuestionTypeIcon = (subType?: string) => {
    switch (subType) {
      case 'mcq': return <CheckSquare className="h-4 w-4" />;
      case 'short': return <FileText className="h-4 w-4" />;
      case 'long': return <BookOpen className="h-4 w-4" />;
      case 'numerical': return <Calculator className="h-4 w-4" />;
      case 'diagram': return <ImageIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: BookOpen },
    { id: 2, title: 'Question Suggestions', icon: Lightbulb },
    { id: 3, title: 'Question Builder', icon: Target },
    { id: 4, title: 'Review & Publish', icon: CheckSquare }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1E1E1E] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Create New Test</DialogTitle>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-[#2A2A2A] rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep >= step.id ? 'bg-[#38B6FF] text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${activeStep >= step.id ? 'text-[#38B6FF]' : 'text-gray-400'}`}>
                  Step {step.id}
                </div>
                <div className={`text-xs ${activeStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px ml-4 ${activeStep > step.id ? 'bg-[#38B6FF]' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Test Title *</Label>
                <Input
                  value={testData.title}
                  onChange={(e) => setTestData({...testData, title: e.target.value})}
                  placeholder="Enter test title"
                  className="bg-[#2A2A2A] border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={testData.duration}
                  onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value)})}
                  className="bg-[#2A2A2A] border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Description</Label>
              <Textarea
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
                placeholder="Brief description of the test"
                className="bg-[#2A2A2A] border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-white mb-2 block">Subject *</Label>
                <Select value={testData.subject} onValueChange={(value) => setTestData({...testData, subject: value})}>
                  <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white mb-2 block">Grade *</Label>
                <Select value={testData.grade} onValueChange={(value) => setTestData({...testData, grade: value})}>
                  <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white mb-2 block">Curriculum *</Label>
                <Select value={testData.curriculum} onValueChange={(value) => setTestData({...testData, curriculum: value})}>
                  <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="a-level">A-Level</SelectItem>
                    <SelectItem value="gcse">GCSE</SelectItem>
                    <SelectItem value="o-level">O-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topics Section */}
            <div>
              <Label className="text-white mb-2 block">Topics *</Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Add a topic"
                  className="bg-[#2A2A2A] border-gray-600 text-white flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                />
                <Button 
                  type="button"
                  onClick={addTopic}
                  className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {testData.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#38B6FF] text-white">
                    {topic}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setActiveStep(2)}
                className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
                disabled={!testData.title || !testData.subject || !testData.grade || !testData.curriculum || testData.topics.length === 0}
              >
                Next: Question Suggestions
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Question Suggestions */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <Card className="bg-[#2A2A2A] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  AI-Suggested Questions
                </CardTitle>
                <p className="text-gray-400">
                  Based on your selected topics: {testData.topics.join(', ')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedQuestions.map((question) => (
                  <div key={question.id} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedSuggestedQuestions.includes(question.id)}
                        onCheckedChange={() => handleSuggestedQuestionToggle(question.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getQuestionTypeIcon(question.subType)}
                          <Badge variant="outline" className="text-xs">
                            {question.subType?.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-[#38B6FF] text-white">
                            {question.marks} marks
                          </Badge>
                        </div>
                        <p className="text-white mb-2">{question.text}</p>
                        
                        {question.subparts && (
                          <div className="ml-4 space-y-1">
                            {question.subparts.map((subpart) => (
                              <div key={subpart.id} className="text-sm text-gray-300">
                                ({subpart.partNumber}) {subpart.text} [{subpart.marks} marks]
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {question.metadata?.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(1)}
                className="border-gray-600 text-gray-300"
              >
                Back
              </Button>
              <div className="space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setActiveStep(3)}
                  className="border-gray-600 text-gray-300"
                >
                  Skip Suggestions
                </Button>
                <Button 
                  onClick={addSuggestedQuestions}
                  className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
                  disabled={selectedSuggestedQuestions.length === 0}
                >
                  Add Selected Questions ({selectedSuggestedQuestions.length})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Question Builder */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <QuestionBuilder 
              questions={questions} 
              onQuestionsChange={setQuestions}
            />
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(2)}
                className="border-gray-600 text-gray-300"
              >
                Back
              </Button>
              <Button 
                onClick={() => setActiveStep(4)}
                className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
                disabled={questions.length === 0}
              >
                Review & Publish
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <Card className="bg-[#2A2A2A] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#38B6FF]">{questions.length}</div>
                    <div className="text-sm text-gray-400">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#38B6FF]">
                      {questions.reduce((total, q) => total + (q.marks || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total Marks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#38B6FF]">{testData.duration}</div>
                    <div className="text-sm text-gray-400">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#38B6FF]">{testData.topics.length}</div>
                    <div className="text-sm text-gray-400">Topics</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setActiveStep(3)}
                className="border-gray-600 text-gray-300"
              >
                Back to Questions
              </Button>
              <div className="space-x-3">
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Save as Draft
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-[#38B6FF] hover:bg-[#2A9DE8]"
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

export default CreateTestModal;
