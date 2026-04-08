
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, BookOpen, BarChart3 } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import ActionButtonGroup from '@/components/shared/ActionButtonGroup';
import TestEditModal from '@/components/test/TestEditModal';
import { mockTests } from '@/data/mockTests';
import BackButton from '@/components/shared/BackButton';

const TeacherTestBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const handleEditTest = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleSaveTest = (editedTest) => {
    // Implement save logic here, e.g., update state or send to API
    console.log('Saving test:', editedTest);
    setIsModalOpen(false);
  };

  const tests = mockTests;

  const stats = [
    { title: 'Total Tests', value: 12, icon: BookOpen, iconColor: 'text-blue-400' },
    { title: 'Avg. Questions', value: 25, icon: BookOpen, iconColor: 'text-green-400' },
    { title: 'Total Attempts', value: 1234, icon: BookOpen, iconColor: 'text-purple-400' },
    { title: 'Avg. Score', value: '78%', icon: BookOpen, iconColor: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Dashboard" className="text-gray-300 hover:text-white hover:bg-gray-700" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Teacher Test Bank</h1>
          <p className="mt-1 text-sm text-gray-400">
            Create, manage, and analyze your tests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Create Test */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Button className="w-full bg-[#38B6FF] hover:bg-[#2A9DE8] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Test
            </Button>
          </div>

          {/* Tests List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {tests.map((test) => (
                <Card key={test.id} className="bg-[#2A2A2A] border-gray-700 hover:border-[#38B6FF] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white">{test.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">{test.description}</p>
                    <ActionButtonGroup
                      buttons={[
                        {
                          label: 'Edit',
                          icon: BookOpen,
                          onClick: () => handleEditTest(test),
                          className: 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'
                        },
                        {
                          label: 'Analytics',
                          icon: BarChart3,
                          onClick: () => alert('Analytics clicked'),
                          className: 'border-gray-600 text-white bg-[#2A2A2A] hover:bg-gray-700 hover:text-white'
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Edit Modal */}
      {isModalOpen && selectedTest && (
        <TestEditModal
          test={selectedTest}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTest}
        />
      )}
    </div>
  );
};

export default TeacherTestBank;
