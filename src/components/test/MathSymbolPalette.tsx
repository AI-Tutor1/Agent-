
import React from 'react';
import { Button } from '@/components/ui/button';

interface MathSymbol {
  symbol: string;
  label: string;
}

interface MathSymbolPaletteProps {
  onSymbolInsert: (symbol: string) => void;
}

const MathSymbolPalette: React.FC<MathSymbolPaletteProps> = ({ onSymbolInsert }) => {
  const mathSymbols: MathSymbol[] = [
    { symbol: '×', label: 'Multiply' },
    { symbol: '÷', label: 'Divide' },
    { symbol: '±', label: 'Plus-minus' },
    { symbol: '≤', label: 'Less than or equal' },
    { symbol: '≥', label: 'Greater than or equal' },
    { symbol: '≠', label: 'Not equal' },
    { symbol: '∞', label: 'Infinity' },
    { symbol: '√', label: 'Square root' },
    { symbol: '∑', label: 'Sum' },
    { symbol: 'π', label: 'Pi' },
    { symbol: 'α', label: 'Alpha' },
    { symbol: 'β', label: 'Beta' },
    { symbol: 'θ', label: 'Theta' },
    { symbol: '°', label: 'Degree' },
    { symbol: '²', label: 'Squared' },
    { symbol: '³', label: 'Cubed' },
  ];

  const fractions = ['½', '⅓', '¼', '¾', '⅕', '⅙', '⅛'];

  return (
    <div className="space-y-3">
      {/* Mathematical Symbols */}
      <div className="space-y-3">
        <h4 className="text-white text-sm font-medium">Mathematical Symbols</h4>
        <div className="grid grid-cols-8 gap-1">
          {mathSymbols.map((item) => (
            <Button
              key={item.symbol}
              variant="outline"
              size="sm"
              onClick={() => onSymbolInsert(item.symbol)}
              className="border-gray-600 text-gray-300 h-8 w-8 p-0"
              title={item.label}
            >
              {item.symbol}
            </Button>
          ))}
        </div>
      </div>

      {/* Common Fractions */}
      <div className="space-y-3">
        <h4 className="text-white text-sm font-medium">Common Fractions</h4>
        <div className="flex flex-wrap gap-1">
          {fractions.map((fraction) => (
            <Button
              key={fraction}
              variant="outline"
              size="sm"
              onClick={() => onSymbolInsert(fraction)}
              className="border-gray-600 text-gray-300 h-8 px-2"
            >
              {fraction}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MathSymbolPalette;
