
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Scan } from 'lucide-react';
import MathSymbolPalette from './MathSymbolPalette';
import MathFormattingToolbar from './MathFormattingToolbar';
import MathEditorCore, { MathEditorRef } from './MathEditorCore';
import TeacherOCR from './TeacherOCR';

interface MathTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClose?: () => void;
}

const MathTextEditor: React.FC<MathTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Type your answer here...",
  onClose
}) => {
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const editorRef = useRef<MathEditorRef>(null);

  const addToHistory = (newValue: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const handleOCRText = (text: string, insertMode: 'replace' | 'append' = 'append') => {
    const newValue = insertMode === 'replace' ? text : `${value}\n${text}`;
    onChange(newValue);
    addToHistory(newValue);
  };

  const handleSymbolInsert = (symbol: string) => {
    editorRef.current?.insertSymbol(symbol);
  };

  const handleFormat = (format: string) => {
    editorRef.current?.formatText(format);
  };

  return (
    <>
      <Card className="w-full bg-[#2A2A2A] border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-lg">Math Text Editor</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOcrModalOpen(true)}
                className="border-[#38B6FF] text-[#38B6FF] hover:bg-[#38B6FF] hover:text-white"
              >
                <Scan className="h-4 w-4 mr-1" />
                OCR
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formatting Toolbar */}
          <MathFormattingToolbar
            onFormat={handleFormat}
            onUndo={undo}
            canUndo={historyIndex > 0}
          />

          {/* Math Symbols */}
          <MathSymbolPalette onSymbolInsert={handleSymbolInsert} />

          {/* Text Area */}
          <MathEditorCore
            ref={editorRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onHistoryAdd={addToHistory}
          />

          {/* Character Count */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>Use LaTeX notation for complex expressions: \\frac&#123;1&#125;&#123;2&#125;, \\sqrt&#123;5&#125;, y^2</span>
            <span>{value.length} characters</span>
          </div>
        </CardContent>
      </Card>

      {/* OCR Modal */}
      {ocrModalOpen && (
        <TeacherOCR
          onTextExtracted={handleOCRText}
          onClose={() => setOcrModalOpen(false)}
          title="Extract Mathematical Text"
          placeholder="Upload an image containing mathematical expressions, formulas, or equations..."
        />
      )}
    </>
  );
};

export default MathTextEditor;
