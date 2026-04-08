
import React from 'react';
import StatCard from '@/components/shared/StatCard';
import { Users, Target, Clock, AlertTriangle } from 'lucide-react';

interface ClassOverviewStatsProps {
  totalStudents: number;
  completedStudents: number;
  averageScore: number;
  averageTime: number;
  flaggedStudents: number;
}

const ClassOverviewStats: React.FC<ClassOverviewStatsProps> = ({
  totalStudents,
  completedStudents,
  averageScore,
  averageTime,
  flaggedStudents
}) => {
  const completionRate = Math.round((completedStudents / totalStudents) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Completion Rate"
        value={`${completionRate}%`}
        icon={Users}
        iconColor="text-[#38B6FF]"
        description={`${completedStudents}/${totalStudents} students`}
      />
      <StatCard
        title="Class Average"
        value={`${averageScore}%`}
        icon={Target}
        iconColor="text-green-500"
      />
      <StatCard
        title="Avg Time"
        value={`${averageTime}min`}
        icon={Clock}
        iconColor="text-blue-500"
      />
      <StatCard
        title="Students Flagged"
        value={flaggedStudents}
        icon={AlertTriangle}
        iconColor="text-yellow-500"
      />
    </div>
  );
};

export default ClassOverviewStats;
