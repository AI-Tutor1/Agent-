import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Copy, RotateCcw, Plus } from 'lucide-react';
import { evaluate } from 'mathjs';

interface CalculatorProps {
  onClose?: () => void;
  onInsertResult?: (result: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onClose, onInsertResult }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const calculation = `${previousValue} ${operation} ${inputValue} = ${newValue}`;
      
      setHistory(prev => [...prev, calculation]);
      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const scientificFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    try {
      switch (func) {
        case 'sin':
          result = Math.sin(inputValue * Math.PI / 180);
          break;
        case 'cos':
          result = Math.cos(inputValue * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(inputValue * Math.PI / 180);
          break;
        case 'log':
          result = Math.log10(inputValue);
          break;
        case 'ln':
          result = Math.log(inputValue);
          break;
        case 'sqrt':
          result = Math.sqrt(inputValue);
          break;
        case 'square':
          result = inputValue * inputValue;
          break;
        case 'inverse':
          result = 1 / inputValue;
          break;
        default:
          result = inputValue;
      }

      const calculation = `${func}(${inputValue}) = ${result}`;
      setHistory(prev => [...prev, calculation]);
      setDisplay(`${parseFloat(result.toFixed(7))}`);
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay('Error');
      setWaitingForOperand(true);
    }
  };

  const memoryOperation = (op: string) => {
    const inputValue = parseFloat(display);
    
    switch (op) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(`${memory}`);
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + inputValue);
        break;
      case 'M-':
        setMemory(memory - inputValue);
        break;
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(display);
    } catch (error) {
      console.error('Failed to copy result:', error);
    }
  };

  const insertResult = () => {
    if (onInsertResult) {
      onInsertResult(display);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[#2A2A2A] border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg">Calculator</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-[#1E1E1E] border border-gray-600 rounded p-4">
          <div className="text-right text-white text-2xl font-mono overflow-hidden">
            {display}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-400 text-xs">
              Memory: {memory !== 0 ? memory : '—'}
            </span>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={copyResult}>
                <Copy className="h-3 w-3" />
              </Button>
              {onInsertResult && (
                <Button variant="ghost" size="sm" onClick={insertResult}>
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Memory and Clear */}
        <div className="grid grid-cols-6 gap-1">
          <Button variant="outline" size="sm" onClick={() => memoryOperation('MC')} className="border-gray-600 text-gray-300">MC</Button>
          <Button variant="outline" size="sm" onClick={() => memoryOperation('MR')} className="border-gray-600 text-gray-300">MR</Button>
          <Button variant="outline" size="sm" onClick={() => memoryOperation('M+')} className="border-gray-600 text-gray-300">M+</Button>
          <Button variant="outline" size="sm" onClick={() => memoryOperation('M-')} className="border-gray-600 text-gray-300">M-</Button>
          <Button variant="outline" size="sm" onClick={clearEntry} className="border-gray-600 text-gray-300">CE</Button>
          <Button variant="outline" size="sm" onClick={clear} className="border-red-600 text-red-300">C</Button>
        </div>

        {/* Scientific Functions */}
        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" size="sm" onClick={() => scientificFunction('sin')} className="border-gray-600 text-gray-300">sin</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('cos')} className="border-gray-600 text-gray-300">cos</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('tan')} className="border-gray-600 text-gray-300">tan</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('log')} className="border-gray-600 text-gray-300">log</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('ln')} className="border-gray-600 text-gray-300">ln</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('sqrt')} className="border-gray-600 text-gray-300">√</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('square')} className="border-gray-600 text-gray-300">x²</Button>
          <Button variant="outline" size="sm" onClick={() => scientificFunction('inverse')} className="border-gray-600 text-gray-300">1/x</Button>
        </div>

        {/* Number Pad and Operations */}
        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" onClick={() => inputNumber('7')} className="border-gray-600 text-white">7</Button>
          <Button variant="outline" onClick={() => inputNumber('8')} className="border-gray-600 text-white">8</Button>
          <Button variant="outline" onClick={() => inputNumber('9')} className="border-gray-600 text-white">9</Button>
          <Button variant="outline" onClick={() => inputOperation('÷')} className="border-[#38B6FF] text-[#38B6FF]">÷</Button>
          
          <Button variant="outline" onClick={() => inputNumber('4')} className="border-gray-600 text-white">4</Button>
          <Button variant="outline" onClick={() => inputNumber('5')} className="border-gray-600 text-white">5</Button>
          <Button variant="outline" onClick={() => inputNumber('6')} className="border-gray-600 text-white">6</Button>
          <Button variant="outline" onClick={() => inputOperation('×')} className="border-[#38B6FF] text-[#38B6FF]">×</Button>
          
          <Button variant="outline" onClick={() => inputNumber('1')} className="border-gray-600 text-white">1</Button>
          <Button variant="outline" onClick={() => inputNumber('2')} className="border-gray-600 text-white">2</Button>
          <Button variant="outline" onClick={() => inputNumber('3')} className="border-gray-600 text-white">3</Button>
          <Button variant="outline" onClick={() => inputOperation('-')} className="border-[#38B6FF] text-[#38B6FF]">−</Button>
          
          <Button variant="outline" onClick={() => inputNumber('0')} className="border-gray-600 text-white col-span-2">0</Button>
          <Button variant="outline" onClick={inputDecimal} className="border-gray-600 text-white">.</Button>
          <Button variant="outline" onClick={() => inputOperation('+')} className="border-[#38B6FF] text-[#38B6FF]">+</Button>
        </div>

        <Button onClick={performCalculation} className="w-full bg-[#38B6FF] hover:bg-[#2A9DE8] text-white">=</Button>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-medium">History</span>
              <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-20 bg-[#1E1E1E] border border-gray-600 rounded p-2">
              {history.map((calc, index) => (
                <div key={index} className="text-gray-300 text-xs font-mono mb-1">
                  {calc}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Calculator;
