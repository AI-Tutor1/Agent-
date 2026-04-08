
export const calculateGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'C+';
  if (percentage >= 65) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-500';
  if (percentage >= 80) return 'text-blue-500';
  if (percentage >= 70) return 'text-yellow-500';
  if (percentage >= 60) return 'text-orange-500';
  return 'text-red-500';
};

export const calculateTimeEfficiency = (timeSpent: number, totalTime: number): number => {
  return (timeSpent / totalTime) * 100;
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const calculateClassRank = (score: number, classScores: number[]): number => {
  const sortedScores = classScores.sort((a, b) => b - a);
  return sortedScores.indexOf(score) + 1;
};

export const calculatePercentile = (score: number, classScores: number[]): number => {
  const sortedScores = classScores.sort((a, b) => a - b);
  const rank = sortedScores.indexOf(score) + 1;
  return Math.round((rank / sortedScores.length) * 100);
};
