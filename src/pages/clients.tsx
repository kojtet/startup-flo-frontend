import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { 
  Building, 
  Users, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Award,
  Star,
  Globe,
  Zap,
  Shield,
  BarChart3,
  DollarSign
} from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();

  const businessTypes = [
    {
      icon: Building,
      title: "Startups & SMEs",
      description: "Growing businesses that need scalable solutions",
      benefits: ["Cost-effective scaling", "Integrated workflows", "Quick implementation", "Flexible pricing"]
    },
    {
      icon: Users,
      title: "Service Companies",
      description: "Professional services and consulting firms",
      benefits: ["Project management", "Time tracking", "Client billing", "Resource allocation"]
    },
    {
      icon: TrendingUp,
      title: "Manufacturing",
      description: "Manufacturing and production companies",
      benefits: ["Inventory management", "Production tracking", "Quality control", "Supply chain"]
    },
    {
      icon: Globe,
      title: "Retail & E-commerce",
      description: "Retail stores and online businesses",
      benefits: ["Multi-location management", "Inventory tracking", "Customer management", "Sales analytics"]
    }
  ];

  const clients = [
    {
      name: "TechCorp Solutions",
      industry: "Technology",
      size: "200+ employees",
      logo: "TC",
      testimonial: "Startup Flo has transformed our operations. The integrated approach saves us hours every week.",
      results: ["40% reduction in admin time", "Improved team collaboration", "Better project visibility"]
    },
    {
      name: "GrowthCo Industries",
      industry: "Manufacturing",
      size: "150+ employees",
      logo: "GC",
      testimonial: "The project management features are incredible. We can track everything from production to delivery.",
      results: ["25% increase in productivity", "Reduced project delays", "Better resource allocation"]
    },
    {
      name: "ServicePro Consulting",
      industry: "Professional Services",
      size: "75+ employees",
      logo: "SP",
      testimonial: "Our clients love the transparency. We can provide detailed reports and insights instantly.",
      results: ["30% faster project delivery", "Improved client satisfaction", "Better time tracking"]
    },
    {
      name: "RetailChain Plus",
      industry: "Retail",
      size: "300+ employees",
      logo: "RC",
      testimonial: "Managing multiple locations has never been easier. The centralized system is a game-changer.",
      results: ["50% reduction in reporting time", "Improved inventory management", "Better customer service"]
    }
  ];

  const stats = [
    { number: "500+", label: "Companies Trust Us" },
    { number: "10,000+", label: "Active Users" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Support Available" }
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
            🏢 Trusted by 500+ Companies
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Our Valued Clients
            <span className="text-blue-600 block">Success Stories</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover how businesses across different industries are transforming their operations 
            with Startup Flo. From startups to enterprises, we help companies scale efficiently.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Business Type
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a startup or enterprise, Startup Flo adapts to your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessTypes.map((type, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <type.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <p className="text-gray-600">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Our Clients
            </h2>
            <p className="text-xl text-gray-600">
              See how real companies are achieving results with Startup Flo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clients.map((client, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{client.logo}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{client.industry}</span>
                        <span>•</span>
                        <span>{client.size}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 italic">"{client.testimonial}"</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Results:</h4>
                    <ul className="space-y-1">
                      {client.results.map((result, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {result}
                        </li>
                      ))}
                    </ul>
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
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your transformation journey with Startup Flo today.
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