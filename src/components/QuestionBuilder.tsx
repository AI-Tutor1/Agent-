
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Image, 
  CheckSquare, 
  Calculator,
  BookOpen,
  Settings,
  Save,
  Eye
} from 'lucide-react';

const QuestionBuilder = () => {
  const [activeTab, setActiveTab] = useState('builder');

  const questionTypes = [
    { id: 'mcq', name: 'Multiple Choice', icon: CheckSquare, color: 'bg-blue-500' },
    { id: 'short', name: 'Short Answer', icon: FileText, color: 'bg-green-500' },
    { id: 'long', name: 'Long Answer', icon: BookOpen, color: 'bg-purple-500' },
    { id: 'numerical', name: 'Numerical', icon: Calculator, color: 'bg-orange-500' },
    { id: 'diagram', name: 'Diagram', icon: Image, color: 'bg-red-500' }
  ];

  const recentQuestions = [
    { id: 1, title: 'Photosynthesis Process', type: 'MCQ', marks: 5, status: 'Published' },
    { id: 2, title: 'Newton\'s Laws of Motion', type: 'Long Answer', marks: 10, status: 'Draft' },
    { id: 3, title: 'Chemical Equations', type: 'Numerical', marks: 8, status: 'Review' },
    { id: 4, title: 'Cell Structure Diagram', type: 'Diagram', marks: 6, status: 'Published' }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Question Builder
          </h2>
          <p className="text-xl text-gray-600">
            Create comprehensive assessments with our AI-powered question builder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Types */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Question Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questionTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mr-3`}>
                    <type.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500">Create {type.name.toLowerCase()} questions</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Builder Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question Builder</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Question Type Selector */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Question</h3>
                  <p className="text-gray-500 mb-4">
                    Select a question type from the left panel to begin creating your assessment
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Question
                  </Button>
                </div>

                {/* AI Suggestions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <h4 className="font-medium text-blue-900">AI Suggestions</h4>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Based on your recent activity, consider creating questions about:
                    <span className="font-medium"> Cell Biology, Chemical Reactions, or Physics Mechanics</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Questions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={question.status === 'Published' ? 'default' : 'secondary'}>
                      {question.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{question.marks} marks</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{question.title}</h4>
                  <p className="text-sm text-gray-500">{question.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionBuilder;
