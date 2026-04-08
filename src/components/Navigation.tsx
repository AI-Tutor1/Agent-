
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Users, Settings, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#2A2A2A] shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-[#38B6FF] mr-2" />
              <span className="text-2xl font-bold text-white">Tuitional AI</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-[#38B6FF] bg-[#38B6FF]/10' 
                      : 'text-gray-300 hover:text-[#38B6FF]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/tests" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/tests') 
                      ? 'text-[#38B6FF] bg-[#38B6FF]/10' 
                      : 'text-gray-300 hover:text-[#38B6FF]'
                  }`}
                >
                  Test Library
                </Link>
                <Link 
                  to="/teacher-test-bank" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/teacher-test-bank') 
                      ? 'text-[#38B6FF] bg-[#38B6FF]/10' 
                      : 'text-gray-300 hover:text-[#38B6FF]'
                  }`}
                >
                  Test Bank
                </Link>
                <Link 
                  to="/questions" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/questions') 
                      ? 'text-[#38B6FF] bg-[#38B6FF]/10' 
                      : 'text-gray-300 hover:text-[#38B6FF]'
                  }`}
                >
                  Question Bank
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#38B6FF] focus:border-transparent text-white"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-[#38B6FF] hover:bg-[#2A9DE8]">
              <Users className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
