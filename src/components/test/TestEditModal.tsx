
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeacherOCR from './TeacherOCR';
import TestBasicInfo from './TestBasicInfo';
import QuestionsList from './QuestionsList';

interface Question {
  id: string;
  type: 'mcq' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  marks: number;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  version: number;
  originalTestId?: string;
}

interface TestEditModalProps {
  test: Test;
  onClose: () => void;
  onSave: (editedTest: Test) => void;
}

const TestEditModal: React.FC<TestEditModalProps> = ({ test, onClose, onSave }) => {
  const { toast } = useToast();
  const [editedTest, setEditedTest] = useState<Test>({
    ...test,
    version: test.version + 1,
    originalTestId: test.originalTestId || test.id,
    id: `${test.id}_v${test.version + 1}` // Create new version ID
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrTarget, setOcrTarget] = useState<{
    questionId: string;
    field: 'question' | 'option';
    optionIndex?: number;
  } | null>(null);

  const updateTestField = (field: keyof Test, value: any) => {
    setEditedTest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateQuestion = (questionId: string, updatedQuestion: Partial<Question>) => {
    setEditedTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updatedQuestion } : q
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'mcq',
      question: 'New question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      marks: 1
    };

    setEditedTest(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalMarks: prev.totalMarks + newQuestion.marks
    }));

    setEditingQuestionId(newQuestion.id);
  };

  const deleteQuestion = (questionId: string) => {
    const questionToDelete = editedTest.questions.find(q => q.id === questionId);
    if (!questionToDelete) return;

    setEditedTest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      totalMarks: prev.totalMarks - questionToDelete.marks
    }));

    toast({
      title: "Question Deleted",
      description: "The question has been removed from the test.",
    });
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = editedTest.questions.find(q => q.id === questionId);
    if (!questionToDuplicate) return;

    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: `q_${Date.now()}`,
      question: `${questionToDuplicate.question} (Copy)`
    };

    setEditedTest(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion],
      totalMarks: prev.totalMarks + duplicatedQuestion.marks
    }));

    toast({
      title: "Question Duplicated",
      description: "A copy of the question has been added to the test.",
    });
  };

  const handleOCRText = (text: string, insertMode: 'replace' | 'append' = 'replace') => {
    if (!ocrTarget) return;

    const { questionId, field, optionIndex } = ocrTarget;
    const question = editedTest.questions.find(q => q.id === questionId);
    if (!question) return;

    if (field === 'question') {
      const newText = insertMode === 'append' ? `${question.question}\n${text}` : text;
      updateQuestion(questionId, { question: newText });
    } else if (field === 'option' && optionIndex !== undefined && question.options) {
      const newOptions = [...question.options];
      const currentText = newOptions[optionIndex] || '';
      newOptions[optionIndex] = insertMode === 'append' ? `${currentText}\n${text}` : text;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const openOCRModal = (questionId: string, field: 'question' | 'option', optionIndex?: number) => {
    setOcrTarget({ questionId, field, optionIndex });
    setOcrModalOpen(true);
  };

  const closeOCRModal = () => {
    setOcrModalOpen(false);
    setOcrTarget(null);
  };

  const handleSave = () => {
    if (!editedTest.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test title.",
        variant: "destructive"
      });
      return;
    }

    if (editedTest.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question to the test.",
        variant: "destructive"
      });
      return;
    }

    onSave(editedTest);
    toast({
      title: "Test Saved",
      description: `Test version ${editedTest.version} has been created successfully.`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-[#2A2A2A] border-gray-700 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
          <div>
            <CardTitle className="text-white text-xl">Edit Test</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="border-[#38B6FF] text-[#38B6FF]">
                Version {editedTest.version}
              </Badge>
              {editedTest.originalTestId && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  Based on: {editedTest.originalTestId}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Test Details */}
            <TestBasicInfo test={editedTest} onUpdate={updateTestField} />

            <Separator className="bg-gray-600" />

            {/* Questions Section */}
            <QuestionsList
              questions={editedTest.questions}
              editingQuestionId={editingQuestionId}
              onAddQuestion={addQuestion}
              onEditQuestion={setEditingQuestionId}
              onUpdateQuestion={updateQuestion}
              onDeleteQuestion={deleteQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onOpenOCR={openOCRModal}
            />
          </div>
        </CardContent>

        <div className="border-t border-gray-700 p-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Version {editedTest.version}
          </Button>
        </div>
      </Card>

      {/* OCR Modal */}
      {ocrModalOpen && ocrTarget && (
        <TeacherOCR
          onTextExtracted={handleOCRText}
          onClose={closeOCRModal}
          title={ocrTarget.field === 'question' ? "Extract Question Text" : "Extract Option Text"}
          placeholder={
            ocrTarget.field === 'question' 
              ? "Upload an image containing the question text..."
              : "Upload an image containing the answer option text..."
          }
        />
      )}
    </div>
  );
};

export default TestEditModal;
