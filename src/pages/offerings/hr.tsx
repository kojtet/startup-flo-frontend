import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  FileText, 
  Shield, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Building,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function HROfferingsPage() {
  const router = useRouter();

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Complete employee lifecycle from onboarding to offboarding",
      features: ["Employee profiles", "Document management", "Performance tracking", "Career development"]
    },
    {
      icon: Calendar,
      title: "Leave Management",
      description: "Streamlined leave requests and approval workflows",
      features: ["Leave requests", "Approval workflows", "Calendar integration", "Leave balance tracking"]
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      description: "Track work hours and attendance with precision",
      features: ["Time tracking", "Attendance monitoring", "Overtime calculation", "Shift management"]
    },
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description: "Automated payroll with tax calculations and compliance",
      features: ["Salary management", "Tax calculations", "Benefits administration", "Payroll reports"]
    },
    {
      icon: FileText,
      title: "Performance Reviews",
      description: "Structured performance evaluation and feedback system",
      features: ["Review cycles", "Goal setting", "360° feedback", "Performance analytics"]
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "Ensure HR compliance and data security",
      features: ["Labor law compliance", "Data protection", "Audit trails", "Role-based access"]
    }
  ];

  const benefits = [
    {
      title: "Reduce HR Administrative Work",
      description: "Automate routine tasks and reduce manual paperwork by 70%",
      icon: TrendingUp
    },
    {
      title: "Improve Employee Experience",
      description: "Self-service portals and mobile access for better engagement",
      icon: Users
    },
    {
      title: "Ensure Compliance",
      description: "Stay compliant with labor laws and regulations automatically",
      icon: Shield
    },
    {
      title: "Data-Driven Decisions",
      description: "Get insights into workforce trends and performance metrics",
      icon: BarChart3
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director, TechCorp",
      content: "Startup Flo's HR module has transformed how we manage our 200+ employees. The automation saves us hours every week.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Manager, GrowthCo",
      content: "The leave management system is incredibly intuitive. Our employees love the self-service features.",
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
            🏢 HR Management Solution
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Complete HR Management
            <span className="text-blue-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your HR operations with our comprehensive human resources management system. 
            From recruitment to retirement, manage every aspect of your workforce efficiently.
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
              Everything You Need for HR Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive HR tools designed to streamline your workforce management
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
              Why Choose Our HR Solution?
            </h2>
            <p className="text-xl text-gray-600">
              Transform your HR operations with powerful automation and insights
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
              Trusted by HR Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what HR leaders have to say about our solution
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
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies that have streamlined their HR processes with Startup Flo.
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