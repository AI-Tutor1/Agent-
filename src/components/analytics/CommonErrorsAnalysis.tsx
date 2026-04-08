
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface CommonError {
  topic: string;
  errorType: string;
  frequency: number;
  affectedStudents: string[];
  impact: 'High' | 'Medium' | 'Low';
  recommendation: string;
}

interface CommonErrorsAnalysisProps {
  errors: CommonError[];
}

const CommonErrorsAnalysis: React.FC<CommonErrorsAnalysisProps> = ({ errors }) => {
  return (
    <Card className="bg-[#2A2A2A] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Common Error Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {errors.map((error, index) => (
            <div key={index} className="border border-gray-600 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{error.topic}</h3>
                    <Badge className={error.impact === 'High' ? 'bg-red-600' : 'bg-yellow-600'}>
                      {error.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-gray-300 mb-2">{error.errorType}</p>
                  <p className="text-gray-400 text-sm">
                    Affected {error.frequency} students: {error.affectedStudents.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{error.frequency}</div>
                  <div className="text-gray-400 text-sm">students</div>
                </div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded border-l-4 border-blue-500">
                <div className="text-sm text-gray-400 mb-1">Recommended Action:</div>
                <div className="text-blue-300">{error.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommonErrorsAnalysis;
