
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateGradeFromPercentage, getGradeColor } from '@/utils/performanceCalculations';

interface PerformanceSummaryProps {
  score: number;
  totalMarks: number;
  percentage: number;
  rank: number;
  totalStudents: number;
  classAverage: number;
}

const PerformanceSummaryCard: React.FC<PerformanceSummaryProps> = ({
  score,
  totalMarks,
  percentage,
  rank,
  totalStudents,
  classAverage
}) => {
  return (
    <Card className="bg-[#2A2A2A] border-gray-700 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white">Your Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold mb-2 ${getGradeColor(percentage)}`}>
            {percentage}%
          </div>
          <div className="text-2xl text-gray-300 mb-2">
            {score}/{totalMarks} marks
          </div>
          <Badge className={`text-lg px-4 py-2 ${getGradeColor(percentage)}`}>
            Grade {calculateGradeFromPercentage(percentage)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{rank}</div>
            <div className="text-gray-400">Class Rank</div>
            <div className="text-sm text-gray-500">out of {totalStudents}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#38B6FF]">{classAverage}%</div>
            <div className="text-gray-400">Class Average</div>
            <div className="text-sm text-gray-500">
              {percentage > classAverage ? 'Above' : 'Below'} average
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummaryCard;
