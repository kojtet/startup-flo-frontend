import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Shield,
  Zap,
  BarChart3,
  FileText,
  ShoppingCart,
  Archive,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Menu,
  X,
  ChevronDown,
  FileText as FileInvoice,
  Clock,
  UserCheck,
  Building,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: Users,
      title: "HR Management",
      description: "Complete employee lifecycle management from onboarding to payroll",
      color: "text-blue-600"
    },
    {
      icon: Briefcase,
      title: "Project Management",
      description: "Track projects, tasks, and deliverables with team collaboration",
      color: "text-green-600"
    },
    {
      icon: DollarSign,
      title: "Finance & Accounting",
      description: "Manage invoices, expenses, and financial reporting in one place",
      color: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "CRM & Sales",
      description: "Track leads, manage deals, and grow your customer relationships",
      color: "text-orange-600"
    },
    {
      icon: ShoppingCart,
      title: "Procurement",
      description: "Streamline vendor management and purchase processes",
      color: "text-indigo-600"
    },
    {
      icon: Archive,
      title: "Asset Management",
      description: "Track company assets, depreciation, and maintenance schedules",
      color: "text-teal-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      content: "Startup Flo has transformed how we manage our business. Everything is now in one place!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Manager, GrowthCo",
      content: "The integrated approach saves us hours every week. Highly recommended for growing companies.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder, StartupXYZ",
      content: "Finally, a platform that grows with your business. The features are exactly what we needed.",
      rating: 5
    }
  ];

  const stats = [
    { number: "500+", label: "Companies Trust Us" },
    { number: "10,000+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Promo Banner */}
      {showPromoBanner && (
        <div className="fixed top-0 w-full z-50">
          <PromoBanner onClose={() => setShowPromoBanner(false)} />
        </div>
      )}
      
      {/* Product Navigation Bar */}
      <div className={`fixed w-full z-40 ${showPromoBanner ? 'top-16' : 'top-0'}`}>
        <ProductNav currentProduct="startup-flo" />
      </div>
      
      {/* Navigation */}
      <nav className={`fixed w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 ${showPromoBanner ? 'top-36' : 'top-20'}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Startup Flo</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <span>Our Offerings</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => router.push('/offerings/hr')}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  HR Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/offerings/timesheets')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Timesheets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/offerings/projects')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Project Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/offerings/finance')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Finance & Accounting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/offerings/crm')}>
                  <Building className="mr-2 h-4 w-4" />
                  CRM & Sales
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/offerings/procurement')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Procurement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </button>
            
            <button 
              onClick={() => router.push('/clients')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Our Clients
            </button>
            
            <button 
              onClick={() => router.push('/blog')} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Blog
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <span>Free</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => router.push('/free/invoice-maker')}>
                  <FileInvoice className="mr-2 h-4 w-4" />
                  Invoice Maker
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/login')}
              className="mr-2"
            >
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/register')}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 mb-2">Our Offerings</div>
                <button 
                  onClick={() => {
                    router.push('/offerings/hr');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  HR Management
                </button>
                <button 
                  onClick={() => {
                    router.push('/offerings/timesheets');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  Timesheets
                </button>
                <button 
                  onClick={() => {
                    router.push('/offerings/projects');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  Project Management
                </button>
                <button 
                  onClick={() => {
                    router.push('/offerings/finance');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  Finance & Accounting
                </button>
                <button 
                  onClick={() => {
                    router.push('/offerings/crm');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  CRM & Sales
                </button>
                <button 
                  onClick={() => {
                    router.push('/offerings/procurement');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  Procurement
                </button>
              </div>
              
              <button 
                onClick={() => {
                  scrollToSection('pricing');
                  setMobileMenuOpen(false);
                }}
                className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full"
              >
                Pricing
              </button>
              
              <button 
                onClick={() => {
                  router.push('/clients');
                  setMobileMenuOpen(false);
                }}
                className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full"
              >
                Our Clients
              </button>
              
              <button 
                onClick={() => {
                  router.push('/blog');
                  setMobileMenuOpen(false);
                }}
                className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full"
              >
                Blog
              </button>
              
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 mb-2">Free</div>
                <button 
                  onClick={() => {
                    router.push('/free/invoice-maker');
                    setMobileMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors text-left w-full pl-4"
                >
                  Invoice Maker
                </button>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={`px-4 ${showPromoBanner ? 'pt-60' : 'pt-48'} pb-20`}>
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            🚀 All-in-One Business Management Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Your Business
            <span className="text-blue-600 block">Like a Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Startup Flo is the complete business operating system that helps you manage HR, 
            projects, finance, CRM, procurement, and assets from one unified platform.
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
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From startup to enterprise, Startup Flo provides all the tools you need to manage 
              and grow your business efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Startup Flo?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Unified Platform</h3>
                    <p className="text-gray-600">No more juggling multiple software solutions. Everything you need in one place.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Zap className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Built for Growth</h3>
                    <p className="text-gray-600">Scalable architecture that grows with your business from startup to enterprise.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                    <p className="text-gray-600">Bank-level security with role-based access control and audit trails.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <BarChart3 className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                    <p className="text-gray-600">Comprehensive dashboards and reports to make data-driven decisions.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">142</div>
                      <div className="text-sm text-gray-600">Employees</div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">23</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">$45K</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business needs. All plans include our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-0 shadow-lg relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Perfect for small teams</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Up to 10 employees</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Core HR features</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Basic project management</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-600 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$79</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">For growing businesses</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Up to 50 employees</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">All HR features</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Advanced project management</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">CRM & Finance modules</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
                <Button className="w-full mt-6">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-0 shadow-lg relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">For large organizations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Unlimited employees</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">All features included</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Dedicated support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Growing Companies
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about Startup Flo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
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
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have streamlined their operations with Startup Flo.
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SF</span>
                </div>
                <span className="text-xl font-bold">Startup Flo</span>
              </div>
              <p className="text-gray-400">
                The complete business operating system for growing companies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Startup Flo. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
} 