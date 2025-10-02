import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemsInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsInfo = true,
  className = ''
}: PaginationProps) {
  // Calculate items shown range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate the range of pages to show
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add first page and dots if necessary
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // Add the main range
    rangeWithDots.push(...range);

    // Add last page and dots if necessary
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return showItemsInfo ? (
      <div className={`flex justify-center text-sm text-muted-foreground ${className}`}>
        Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </div>
    ) : null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Items Info */}
      {showItemsInfo && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex items-center justify-center gap-2">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${currentPage === 1 
              ? 'text-muted-foreground cursor-not-allowed bg-muted/50' 
              : 'text-foreground hover:text-primary hover:bg-accent border border-border'
            }
          `}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`dots-${index}`}
                  className="min-w-[40px] h-10 rounded-lg flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <motion.button
                key={pageNum}
                whileHover={{ scale: isActive ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pageNum)}
                className={`
                  min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:text-primary hover:bg-accent border border-border'
                  }
                `}
              >
                {pageNum}
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${currentPage === totalPages 
              ? 'text-muted-foreground cursor-not-allowed bg-muted/50' 
              : 'text-foreground hover:text-primary hover:bg-accent border border-border'
            }
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </nav>

      {/* Mobile simplified pagination */}
      <div className="sm:hidden flex items-center justify-between text-sm text-muted-foreground">
        <div>Page {currentPage} of {totalPages}</div>
        <div>{totalItems} items</div>
      </div>
    </div>
  );
}