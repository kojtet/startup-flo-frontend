import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  onClose?: () => void;
}

export function PromoBanner({ onClose }: PromoBannerProps) {
  return (
    <div className="bg-black text-white relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              <Star className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <span className="font-bold text-base sm:text-lg">
                🎉 LIMITED TIME OFFER: 90% OFF for 3 Months!
              </span>
              <span className="text-sm sm:text-base opacity-95 font-medium">
                Get Startup Flo at just $7.90/month for the first 3 months
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-sm px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              BUY NOW
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-yellow-300 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 