
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MathEditorCoreProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onHistoryAdd: (value: string) => void;
}

export interface MathEditorRef {
  insertSymbol: (symbol: string) => void;
  formatText: (format: string) => void;
}

const MathEditorCore = forwardRef<MathEditorRef, MathEditorCoreProps>(({
  value,
  onChange,
  placeholder = "Type your answer here...",
  onHistoryAdd
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    onHistoryAdd(newValue);
  };

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + symbol + value.substring(end);
    
    onChange(newValue);
    onHistoryAdd(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'subscript':
        formattedText = `_{${selectedText}}`;
        break;
      case 'superscript':
        formattedText = `^{${selectedText}}`;
        break;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    onHistoryAdd(newValue);
  };

  useImperativeHandle(ref, () => ({
    insertSymbol,
    formatText
  }));

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="bg-[#1E1E1E] border-gray-600 text-white min-h-[150px] font-mono"
    />
  );
});

MathEditorCore.displayName = 'MathEditorCore';

export default MathEditorCore;
