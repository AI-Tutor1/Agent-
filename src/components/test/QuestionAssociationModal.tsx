
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X,
  BookOpen,
  GraduationCap,
  Award,
  FileText
} from 'lucide-react';
import { QuestionMetadata } from '@/types/question';

interface QuestionAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: QuestionMetadata) => void;
  initialMetadata?: Partial<QuestionMetadata>;
}

const QuestionAssociationModal: React.FC<QuestionAssociationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMetadata = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [metadata, setMetadata] = useState<Partial<QuestionMetadata>>({
    topic: [],
    subject: '',
    grade: [],
    curriculum: [],
    level: [],
    board: [],
    difficulty: 'Foundation',
    year: [],
    paperType: [],
    paperCode: [],
    attempt: [],
    syllabusCode: [],
    syllabusType: [],
    variant: [],
    marks: 1,
    estimatedTime: 2,
    tags: [],
    learningObjectives: [],
    ...initialMetadata
  });

  const steps = [
    { id: 1, title: 'Academic Info', icon: BookOpen },
    { id: 2, title: 'Examination', icon: GraduationCap },
    { id: 3, title: 'Assessment', icon: Award },
    { id: 4, title: 'Additional', icon: FileText }
  ];

  const subjects = ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'English', 'History'];
  const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const curriculums = ['CBSE', 'ICSE', 'IB', 'Cambridge', 'Edexcel'];
  const boards = ['Cambridge', 'Edexcel', 'AQA', 'OCR', 'WJEC'];
  const levels = ['IGCSE', 'GCSE', 'A-Level', 'O-Level'];
  const syllabusTypes = ['Extended', 'Core', 'Foundation', 'Higher'];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    onSave(metadata as QuestionMetadata);
    onClose();
  };

  const addToArray = (field: keyof QuestionMetadata, value: string | number) => {
    const currentArray = metadata[field] as any[] || [];
    if (!currentArray.includes(value)) {
      setMetadata(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }));
    }
  };

  const removeFromArray = (field: keyof QuestionMetadata, value: string | number) => {
    const currentArray = metadata[field] as any[] || [];
    setMetadata(prev => ({
      ...prev,
      [field]: currentArray.filter(item => item !== value)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Subject *</Label>
                <Select 
                  value={metadata.subject} 
                  onValueChange={(value) => setMetadata(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Topic</Label>
                <Input
                  placeholder="Add topic and press Enter"
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        addToArray('topic', value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {metadata.topic?.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#38B6FF] text-white">
                      {topic}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('topic', topic)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Grade</Label>
                <Select onValueChange={(value) => addToArray('grade', value)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.grade?.map((grade, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-600 text-white">
                      {grade}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('grade', grade)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Curriculum</Label>
                <Select onValueChange={(value) => addToArray('curriculum', value)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add curriculum" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {curriculums.map(curriculum => (
                      <SelectItem key={curriculum} value={curriculum}>{curriculum}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.curriculum?.map((curriculum, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600 text-white">
                      {curriculum}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('curriculum', curriculum)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Level</Label>
                <Select onValueChange={(value) => addToArray('level', value)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.level?.map((level, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-600 text-white">
                      {level}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('level', level)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Board</Label>
                <Select onValueChange={(value) => addToArray('board', value)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add board" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {boards.map(board => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.board?.map((board, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-600 text-white">
                      {board}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('board', board)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Difficulty Level</Label>
                <Select 
                  value={metadata.difficulty} 
                  onValueChange={(value) => setMetadata(prev => ({ ...prev, difficulty: value as any }))}
                >
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    <SelectItem value="Foundation">Foundation</SelectItem>
                    <SelectItem value="Higher">Higher</SelectItem>
                    <SelectItem value="Extended">Extended</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Year</Label>
                <Input
                  type="number"
                  placeholder="Add year and press Enter"
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt((e.target as HTMLInputElement).value);
                      if (value && value > 1990 && value <= 2030) {
                        addToArray('year', value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {metadata.year?.map((year, index) => (
                    <Badge key={index} variant="secondary" className="bg-indigo-600 text-white">
                      {year}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('year', year)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Paper Type</Label>
                <Input
                  placeholder="Add paper type and press Enter"
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        addToArray('paperType', value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {metadata.paperType?.map((type, index) => (
                    <Badge key={index} variant="secondary" className="bg-teal-600 text-white">
                      {type}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('paperType', type)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Paper Code</Label>
                <Input
                  placeholder="Add paper code and press Enter"
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        addToArray('paperCode', value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {metadata.paperCode?.map((code, index) => (
                    <Badge key={index} variant="secondary" className="bg-pink-600 text-white">
                      {code}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('paperCode', code)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Syllabus Type</Label>
                <Select onValueChange={(value) => addToArray('syllabusType', value)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    {syllabusTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.syllabusType?.map((type, index) => (
                    <Badge key={index} variant="secondary" className="bg-cyan-600 text-white">
                      {type}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('syllabusType', type)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Variant</Label>
                <Select onValueChange={(value) => addToArray('variant', parseInt(value))}>
                  <SelectTrigger className="bg-[#1E1E1E] border-gray-600 text-white">
                    <SelectValue placeholder="Add variant" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-600">
                    <SelectItem value="1">Variant 1</SelectItem>
                    <SelectItem value="2">Variant 2</SelectItem>
                    <SelectItem value="3">Variant 3</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {metadata.variant?.map((variant, index) => (
                    <Badge key={index} variant="secondary" className="bg-yellow-600 text-white">
                      V{variant}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('variant', variant)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Marks</Label>
                <Input
                  type="number"
                  value={metadata.marks || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Estimated Time (minutes)</Label>
                <Input
                  type="number"
                  value={metadata.estimatedTime || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 2 }))}
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Tags</Label>
                <Input
                  placeholder="Add tag and press Enter"
                  className="bg-[#1E1E1E] border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        addToArray('tags', value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {metadata.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#38B6FF] text-white">
                      {tag}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('tags', tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Learning Objectives</Label>
              <Textarea
                placeholder="Describe the learning objectives for this question..."
                className="bg-[#1E1E1E] border-gray-600 text-white min-h-[100px]"
                value={metadata.learningObjectives?.join('\n') || ''}
                onChange={(e) => {
                  const objectives = e.target.value.split('\n').filter(obj => obj.trim());
                  setMetadata(prev => ({ ...prev, learningObjectives: objectives }));
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2A2A2A] border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Question Association</DialogTitle>
        </DialogHeader>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step.id 
                  ? 'bg-[#38B6FF] border-[#38B6FF] text-white' 
                  : 'border-gray-600 text-gray-400'
                }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-16 ${currentStep > step.id ? 'bg-[#38B6FF]' : 'bg-gray-600'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <Button 
                onClick={handleNext}
                className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Association
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionAssociationModal;
