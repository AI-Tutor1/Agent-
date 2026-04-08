
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const PerformanceTrends = () => {
  const { studentId } = useParams();

  const mockTrendsData = {
    studentId,
    studentName: 'John Doe',
    overallProgress: 12.5, // percentage improvement over last 6 months
    scoreHistory: [
      { test: 'Test 1', date: '2024-01-15', score: 72, subject: 'Biology' },
      { test: 'Test 2', date: '2024-01-22', score: 78, subject: 'Chemistry' },
      { test: 'Test 3', date: '2024-01-29', score: 75, subject: 'Biology' },
      { test: 'Test 4', date: '2024-02-05', score: 82, subject: 'Physics' },
      { test: 'Test 5', date: '2024-02-12', score: 84, subject: 'Biology' },
      { test: 'Test 6', date: '2024-02-19', score: 88, subject: 'Chemistry' }
    ],
    subjectPerformance: [
      { subject: 'Biology', averageScore: 78, testsCount: 8, improvement: 15 },
      { subject: 'Chemistry', averageScore: 83, testsCount: 6, improvement: 8 },
      { subject: 'Physics', averageScore: 76, testsCount: 4, improvement: 22 }
    ],
    timeAnalysis: [
      { category: 'Quick Questions', percentage: 35, color: '#38B6FF' },
      { category: 'Medium Questions', percentage: 45, color: '#10B981' },
      { category: 'Complex Questions', percentage: 20, color: '#F59E0B' }
    ],
    monthlyProgress: [
      { month: 'Jan', tests: 3, avgScore: 75 },
      { month: 'Feb', tests: 4, avgScore: 81 },
      { month: 'Mar', tests: 2, avgScore: 86 }
    ]
  };

  const chartConfig = {
    score: {
      label: "Score",
      color: "#38B6FF",
    },
    avgScore: {
      label: "Average Score",
      color: "#10B981",
    },
    percentage: {
      label: "Percentage",
      color: "#38B6FF",
    },
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link to="/test-results/test-123">
                <Button variant="ghost" className="text-gray-400 hover:text-white mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Performance Trends</h1>
                <p className="text-gray-400">{mockTrendsData.studentName} • Progress Analytics</p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{mockTrendsData.overallProgress}% improvement
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tests</p>
                  <p className="text-2xl font-bold text-white">18</p>
                </div>
                <Target className="h-8 w-8 text-[#38B6FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-white">79%</p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Best Subject</p>
                  <p className="text-2xl font-bold text-white">Chemistry</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Time</p>
                  <p className="text-2xl font-bold text-white">42min</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Trends */}
          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={mockTrendsData.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-score)" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="bg-[#2A2A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={mockTrendsData.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="averageScore" fill="var(--color-score)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress */}
        <Card className="bg-[#2A2A2A] border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={mockTrendsData.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="var(--color-avgScore)" 
                  strokeWidth={3} 
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time Analysis */}
        <Card className="bg-[#2A2A2A] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Time Distribution Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={mockTrendsData.timeAnalysis}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {mockTrendsData.timeAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="space-y-4">
                {mockTrendsData.timeAnalysis.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-300">{item.category}</span>
                    <span className="text-white font-semibold">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTrends;
