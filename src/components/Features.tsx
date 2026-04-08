
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  Lightbulb, 
  Zap,
  BookOpen,
  Target,
  Users,
  Settings
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Question Generation",
      description: "Create diverse question types including MCQs, short answers, and numerical problems with intelligent AI assistance.",
      color: "bg-blue-500",
      badge: "Core Feature"
    },
    {
      icon: FileText,
      title: "Rich Text Editor",
      description: "Advanced text editing with support for mathematical equations, diagrams, and multimedia content.",
      color: "bg-green-500",
      badge: "Enhanced"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics to track student performance, question difficulty, and learning outcomes.",
      color: "bg-purple-500",
      badge: "Insights"
    },
    {
      icon: CheckCircle,
      title: "Automated Grading",
      description: "Intelligent marking schemes with customizable scoring algorithms and detailed feedback generation.",
      color: "bg-orange-500",
      badge: "Automation"
    },
    {
      icon: Target,
      title: "Adaptive Learning",
      description: "Personalized question difficulty adjustment based on student performance and learning patterns.",
      color: "bg-red-500",
      badge: "Smart"
    },
    {
      icon: Users,
      title: "Collaborative Platform",
      description: "Team-based question creation, sharing, and review processes for educational institutions.",
      color: "bg-indigo-500",
      badge: "Teamwork"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Tuitional AI transforms the way educators create, manage, and assess learning content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of educators who are already using Tuitional AI to create better learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
