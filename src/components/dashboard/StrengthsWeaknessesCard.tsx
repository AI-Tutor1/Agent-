
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Strength {
  topic: string;
  score: number;
  description: string;
}

interface Weakness {
  topic: string;
  score: number;
  description: string;
  improvement: string;
}

interface StrengthsWeaknessesProps {
  strengths: Strength[];
  weaknesses: Weakness[];
}

const StrengthsWeaknessesCard: React.FC<StrengthsWeaknessesProps> = ({
  strengths,
  weaknesses
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <Card className="bg-[#2A2A2A] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Your Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {strengths.map((strength, index) => (
            <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{strength.topic}</h3>
                <Badge className="bg-green-600 text-white">{strength.score}%</Badge>
              </div>
              <p className="text-gray-300 text-sm">{strength.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card className="bg-[#2A2A2A] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weaknesses.map((weakness, index) => (
            <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{weakness.topic}</h3>
                <Badge className="bg-red-600 text-white">{weakness.score}%</Badge>
              </div>
              <p className="text-gray-300 text-sm mb-2">{weakness.description}</p>
              <div className="bg-[#1E1E1E] p-3 rounded border-l-4 border-blue-500">
                <div className="text-sm text-gray-400 mb-1">Improvement Tip:</div>
                <div className="text-blue-300 text-sm">{weakness.improvement}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrengthsWeaknessesCard;
