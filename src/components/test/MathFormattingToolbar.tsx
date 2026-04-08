
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Subscript, 
  Superscript, 
  Undo 
} from 'lucide-react';

interface MathFormattingToolbarProps {
  onFormat: (format: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const MathFormattingToolbar: React.FC<MathFormattingToolbarProps> = ({
  onFormat,
  onUndo,
  canUndo
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFormat('bold')}
        className="border-gray-600 text-gray-300"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFormat('italic')}
        className="border-gray-600 text-gray-300"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFormat('subscript')}
        className="border-gray-600 text-gray-300"
      >
        <Subscript className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFormat('superscript')}
        className="border-gray-600 text-gray-300"
      >
        <Superscript className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-8" />
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="border-gray-600 text-gray-300"
      >
        <Undo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MathFormattingToolbar;
