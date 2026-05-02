import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-premium-900/30 border-t border-premium-border/50">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-silver-300 bg-premium-800/50 hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('admin.common.pagination.previous')}
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-silver-300 bg-premium-800/50 hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('admin.common.pagination.next')}
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-silver-400">
            {t('admin.common.pagination.page_of', { current: currentPage, total: totalPages })}
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-premium-800/50 text-sm font-medium text-silver-400 hover:bg-premium-800 hover:text-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="sr-only">Previous</span>
              {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            
            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isCurrent = pageNumber === currentPage;
              
              // Only show first, last, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-bold transition-all duration-200 ${
                      isCurrent 
                        ? 'z-10 bg-gold-500 text-premium-900 border-gold-500' 
                        : 'bg-premium-800/50 text-silver-400 hover:bg-premium-800 hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Show ellipses
              if (
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-white/10 bg-premium-800/50 text-sm font-medium text-silver-500">
                    ...
                  </span>
                );
              }
              
              return null;
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/10 bg-premium-800/50 text-sm font-medium text-silver-400 hover:bg-premium-800 hover:text-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="sr-only">Next</span>
              {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
