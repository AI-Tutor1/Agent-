
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: any[];
  version: number;
  originalTestId?: string;
}

interface TestBasicInfoProps {
  test: Test;
  onUpdate: (field: keyof Test, value: any) => void;
}

const TestBasicInfo: React.FC<TestBasicInfoProps> = ({ test, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Test Title</Label>
          <Input
            value={test.title}
            onChange={(e) => onUpdate('title', e.target.value)}
            className="bg-[#1E1E1E] border-gray-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Subject</Label>
          <Input
            value={test.subject}
            onChange={(e) => onUpdate('subject', e.target.value)}
            className="bg-[#1E1E1E] border-gray-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Duration (minutes)</Label>
          <Input
            type="number"
            value={test.duration}
            onChange={(e) => onUpdate('duration', parseInt(e.target.value) || 0)}
            className="bg-[#1E1E1E] border-gray-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Total Marks</Label>
          <Input
            type="number"
            value={test.totalMarks}
            onChange={(e) => onUpdate('totalMarks', parseInt(e.target.value) || 0)}
            className="bg-[#1E1E1E] border-gray-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Description</Label>
        <Textarea
          value={test.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          className="bg-[#1E1E1E] border-gray-600 text-white"
          rows={3}
        />
      </div>
    </div>
  );
};

export default TestBasicInfo;
