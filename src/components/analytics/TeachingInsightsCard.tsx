
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { getPriorityColor } from '@/utils/gradeUtils';

interface TeachingInsight {
  category: string;
  finding: string;
  evidence: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface TeachingInsightsCardProps {
  insights: TeachingInsight[];
}

const TeachingInsightsCard: React.FC<TeachingInsightsCardProps> = ({ insights }) => {
  return (
    <Card className="bg-[#2A2A2A] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Teaching Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{insight.category}</h3>
                <Badge className={getPriorityColor(insight.priority)}>
                  {insight.priority}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-400 text-sm">Finding:</div>
                  <div className="text-gray-300 text-sm">{insight.finding}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Evidence:</div>
                  <div className="text-gray-300 text-sm">{insight.evidence}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Recommended Action:</div>
                  <div className="text-blue-300 text-sm">{insight.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeachingInsightsCard;
