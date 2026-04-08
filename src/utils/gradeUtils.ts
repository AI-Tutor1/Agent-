
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getFlagColor = (flag: string): string => {
  switch (flag) {
    case 'Exceptional': return 'bg-green-600 text-white';
    case 'Above average': return 'bg-blue-600 text-white';
    case 'Below average': return 'bg-yellow-600 text-white';
    case 'Needs support': return 'bg-red-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

export const getDifficultyColor = (difficulty?: string): string => {
  switch (difficulty) {
    case 'Foundation': return 'bg-green-500';
    case 'Core': return 'bg-blue-500';
    case 'Extended': return 'bg-orange-500';
    case 'Higher': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};
