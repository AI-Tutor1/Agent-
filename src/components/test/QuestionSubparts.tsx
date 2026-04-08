
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { EnhancedQuestion } from '@/types/question';

interface QuestionSubpartsProps {
  question: EnhancedQuestion;
  onUpdateSubparts: (subparts: any[]) => void;
}

const QuestionSubparts: React.FC<QuestionSubpartsProps> = ({
  question,
  onUpdateSubparts
}) => {
  if (question.type !== 'question') {
    return null;
  }

  const addSubpart = () => {
    const newSubpart = {
      id: Date.now().toString(),
      partNumber: String.fromCharCode(97 + (question.subparts?.length || 0)),
      text: '',
      marks: 1,
      subType: 'short' as const
    };
    const updatedSubparts = [...(question.subparts || []), newSubpart];
    onUpdateSubparts(updatedSubparts);
  };

  const updateSubpart = (subpartId: string, field: string, value: any) => {
    const updatedSubparts = question.subparts?.map(sp => 
      sp.id === subpartId ? { ...sp, [field]: value } : sp
    );
    if (updatedSubparts) {
      onUpdateSubparts(updatedSubparts);
    }
  };

  const removeSubpart = (subpartId: string) => {
    const updatedSubparts = question.subparts?.filter(sp => sp.id !== subpartId);
    onUpdateSubparts(updatedSubparts || []);
  };

  return (
    <div>
      <Label className="text-white mb-2 block">Question Subparts</Label>
      <div className="space-y-3">
        {question.subparts?.map((subpart, index) => (
          <div key={subpart.id} className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-2">
                {subpart.partNumber}
              </Badge>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={subpart.text}
                  onChange={(e) => updateSubpart(subpart.id, 'text', e.target.value)}
                  placeholder={`Part ${subpart.partNumber} question text...`}
                  className="bg-[#2A2A2A] border-gray-600 text-white"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={subpart.marks}
                    onChange={(e) => updateSubpart(subpart.id, 'marks', parseInt(e.target.value) || 0)}
                    placeholder="Marks"
                    className="w-20 bg-[#2A2A2A] border-gray-600 text-white"
                  />
                  <Select 
                    value={subpart.subType || ''} 
                    onValueChange={(value) => updateSubpart(subpart.id, 'subType', value)}
                  >
                    <SelectTrigger className="bg-[#2A2A2A] border-gray-600 text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-gray-600">
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="numerical">Numerical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubpart(subpart.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addSubpart}
          className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Subpart
        </Button>
      </div>
    </div>
  );
};

export default QuestionSubparts;
