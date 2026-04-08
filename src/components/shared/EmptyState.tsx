
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
}) => {
  return (
    <Card className="bg-[#1E1E1E] border-gray-700 border-dashed">
      <CardContent className="p-8 text-center">
        {icon}
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <Button 
          onClick={onAction}
          className="bg-[#38B6FF] hover:bg-[#2A9DE8] text-white"
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
