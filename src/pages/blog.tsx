import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductNav } from '@/components/ui/product-nav';
import { PromoBanner } from '@/components/ui/promo-banner';
import { 
  Calendar,
  User,
  ArrowRight,
  Clock,
  Tag
} from 'lucide-react';

export default function BlogPage() {
  const router = useRouter();

  const articles = [
    {
      title: "10 Ways to Streamline Your HR Operations in 2024",
      excerpt: "Discover the latest HR automation trends and how they can transform your business operations.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "HR Management",
      image: "📊"
    },
    {
      title: "The Complete Guide to Project Management for Startups",
      excerpt: "Learn essential project management strategies that help startups scale efficiently and deliver results.",
      author: "Michael Chen",
      date: "March 12, 2024",
      readTime: "8 min read",
      category: "Project Management",
      image: "🚀"
    },
    {
      title: "Financial Management Tips for Growing Businesses",
      excerpt: "Essential financial management practices that every growing business should implement.",
      author: "Emily Rodriguez",
      date: "March 10, 2024",
      readTime: "6 min read",
      category: "Finance",
      image: "💰"
    },
    {
      title: "Building a Customer-Centric CRM Strategy",
      excerpt: "How to build and implement a CRM strategy that puts your customers first and drives growth.",
      author: "David Wilson",
      date: "March 8, 2024",
      readTime: "7 min read",
      category: "CRM",
      image: "👥"
    },
    {
      title: "Procurement Best Practices for SMEs",
      excerpt: "Optimize your procurement processes with these proven strategies for small and medium enterprises.",
      author: "Lisa Thompson",
      date: "March 5, 2024",
      readTime: "4 min read",
      category: "Procurement",
      image: "📦"
    },
    {
      title: "Asset Management: Protecting Your Business Investments",
      excerpt: "Learn how proper asset management can protect your investments and improve operational efficiency.",
      author: "Robert Kim",
      date: "March 3, 2024",
      readTime: "6 min read",
      category: "Asset Management",
      image: "🏢"
    }
  ];

  const categories = [
    "All Posts",
    "HR Management", 
    "Project Management",
    "Finance",
    "CRM",
    "Procurement",
    "Asset Management"
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
            📝 Business Insights & Tips
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Startup Flo Blog
            <span className="text-blue-600 block">Insights & Tips</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest business management trends, tips, and insights 
            to help your business grow and succeed.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Badge 
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-50"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-4">{article.image}</div>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {article.category}
                  </Badge>
                  <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {article.date}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest business insights, tips, and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="px-8 py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 