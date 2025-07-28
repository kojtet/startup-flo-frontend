import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Target,
  FileText,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();

  const features = [
    {
      icon: Target,
      title: "Project Planning",
      description: "Comprehensive project planning and goal setting",
      features: ["Goal setting", "Timeline planning", "Resource allocation", "Risk assessment"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless team collaboration and communication",
      features: ["Team assignments", "Real-time messaging", "File sharing", "Task delegation"]
    },
    {
      icon: Calendar,
      title: "Task Management",
      description: "Organize and track tasks efficiently",
      features: ["Task creation", "Priority setting", "Deadline tracking", "Progress monitoring"]
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor project progress and performance",
      features: ["Progress dashboards", "Milestone tracking", "Performance metrics", "Reporting"]
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized document storage and version control",
      features: ["Document storage", "Version control", "Access permissions", "Search functionality"]
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track time spent on projects and tasks",
      features: ["Time logging", "Project billing", "Time reports", "Productivity analysis"]
    }
  ];

  const benefits = [
    {
      title: "Improve Project Delivery",
      description: "Deliver projects on time and within budget with better planning and tracking",
      icon: Target
    },
    {
      title: "Enhance Team Productivity",
      description: "Boost team productivity with clear task assignments and progress tracking",
      icon: TrendingUp
    },
    {
      title: "Better Communication",
      description: "Improve team communication and collaboration with integrated tools",
      icon: MessageSquare
    },
    {
      title: "Data-Driven Decisions",
      description: "Make informed decisions with comprehensive project analytics and reports",
      icon: BarChart3
    }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Project Manager, TechStart",
      content: "The project management features have revolutionized how we handle our development projects. Everything is now organized and trackable.",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "Team Lead, DesignCo",
      content: "Our team collaboration has improved dramatically. The real-time updates and task management keep everyone on the same page.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Promo Banner */}
      <div className="fixed top-0 w-full z-50">
        <PromoBanner />
      </div>
      
      {/* Product Navigation Bar */}
      <div className="fixed top-16 w-full z-40">
        <ProductNav currentProduct="startup-flo" />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-36 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Startup Flo</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-60 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            📋 Project Management Solution
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Project Management
            <span className="text-blue-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your project management with our comprehensive solution. 
            Plan, track, and deliver projects efficiently with powerful collaboration tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/register')}
              className="text-lg px-8 py-3"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Project Management Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to plan, execute, and deliver successful projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <p className="text-gray-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Project Management Solution?
            </h2>
            <p className="text-xl text-gray-600">
              Transform your project delivery with powerful tools and insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Project Managers
            </h2>
            <p className="text-xl text-gray-600">
              See what project management professionals have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Award key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Project Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies that have improved their project delivery with Startup Flo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/auth/register')}
              className="text-lg px-8 py-3"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 