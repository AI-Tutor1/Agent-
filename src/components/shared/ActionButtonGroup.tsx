
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

interface ActionButtonGroupProps {
  buttons: ActionButton[];
  className?: string;
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({ buttons, className = '' }) => {
  return (
    <div className={`flex justify-center space-x-4 mt-4 ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || 'outline'}
          onClick={button.onClick}
          className={button.className || 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'}
        >
          <button.icon className="mr-2 h-4 w-4" />
          {button.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtonGroup;
