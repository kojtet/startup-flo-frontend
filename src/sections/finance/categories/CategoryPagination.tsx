import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function CategoryPagination({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPreviousPage,
  startIndex,
  endIndex,
  totalItems
}: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      // Adjust if we're near the edges
      if (currentPage <= 3) {
        end = Math.min(totalPages, 5);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(1, totalPages - 4);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Results info */}
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            // Add ellipsis if there's a gap
            const showEllipsisBefore = index === 0 && page > 1;
            const showEllipsisAfter = index === pageNumbers.length - 1 && page < totalPages;
            
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && (
                  <div className="flex items-center px-2">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
                
                {showEllipsisAfter && (
                  <div className="flex items-center px-2">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 