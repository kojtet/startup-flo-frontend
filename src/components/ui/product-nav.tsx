import React from 'react';
import { useRouter } from 'next/router';

interface ProductNavProps {
  currentProduct?: string;
}

export function ProductNav({ currentProduct = 'startup-flo' }: ProductNavProps) {
  const router = useRouter();

  const products = [
    {
      id: 'techly-africa',
      name: 'Techly Africa',
      description: 'Main Company',
      url: 'https://techlyafrica.com',
      active: currentProduct === 'techly-africa'
    },
    {
      id: 'startup-flo',
      name: 'Startup Flo',
      description: 'Business Management',
      url: '/',
      active: currentProduct === 'startup-flo'
    },
    {
      id: 'timefence',
      name: 'TimeFence',
      description: 'Attendance & HR',
      url: 'https://timefence.techlyafrica.com',
      active: currentProduct === 'timefence'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-6">
            {products.map((product) => (
              <div key={product.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (product.url.startsWith('http')) {
                      window.open(product.url, '_blank');
                    } else {
                      router.push(product.url);
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                    product.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-semibold ${product.active ? 'text-blue-700' : 'text-gray-700'}`}>
                      {product.name}
                    </span>
                    <span className="text-xs text-gray-500">{product.description}</span>
                  </div>
                  {product.active && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 