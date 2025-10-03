'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { 
  Search,
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { type Product } from '@/models/interfaces/product.interface';
import { Pagination } from '@/components/general/Pagination';
import { ProductCard } from '@/components/general/ProductCard';
import { useMainContext } from '@/context/MainContext';

interface PaginatedSearchResponse {
  items: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// SearchPageContent component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleLogoClick, handleProductClick } = useMainContext();
  
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const [searchResults, setSearchResults] = useState<PaginatedSearchResponse>({
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load search history from localStorage
    const loadSearchHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem('vauria_search_history') || '[]');
        setSearchHistory(history.slice(0, 10)); // Keep only last 10 searches
      } catch {
        setSearchHistory([]);
      }
    };
    loadSearchHistory();

    // If initial query provided, search immediately
    if (initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query = searchQuery, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);

    try {
      // Use productService.getProductsFromApi with search parameter
      const apiProducts = await productService.getProductsFromApi({ 
        search: query.trim(),
        per_page: 12,
        page
      });
      
      // Convert to paginated format
      const paginatedData: PaginatedSearchResponse = {
        items: apiProducts,
        totalItems: apiProducts.length,
        totalPages: Math.ceil(apiProducts.length / 12),
        currentPage: page,
        hasNextPage: apiProducts.length === 12, // Assume more if we got a full page
        hasPreviousPage: page > 1
      };
      
      setSearchResults(paginatedData);
      
      // Update search history in localStorage
      const currentHistory = JSON.parse(localStorage.getItem('vauria_search_history') || '[]');
      const newHistory = [query, ...currentHistory.filter((h: string) => h !== query)].slice(0, 10);
      localStorage.setItem('vauria_search_history', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
      
      // Update URL with search query
      const newUrl = `/search?q=${encodeURIComponent(query)}`;
      router.push(newUrl);
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (searchQuery.trim()) {
      await handleSearch(searchQuery, page);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length > 2) {
      // Simple suggestions based on common jewelry terms
      const commonTerms = ['ring', 'necklace', 'earrings', 'bracelet', 'chain', 'gold', 'silver', 'diamond'];
      const filteredSuggestions = commonTerms.filter(term => 
        term.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('vauria_search_history');
    setSearchHistory([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={handleLogoClick}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Search Form - Only show when no search has been performed */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="max-w-2xl mx-auto relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search for rings, necklaces, earrings..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  onBlur={(e) => {
                    // Only hide suggestions if not clicking on a suggestion
                    setTimeout(() => setShowSuggestions(false), 100);
                  }}
                  className="pl-12 h-14 text-lg bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button 
                  type="submit"
                  disabled={!searchQuery.trim() || loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 bg-primary hover:bg-primary/90 font-sans transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50"
                  onMouseLeave={() => setShowSuggestions(false)}
                >
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Suggestions
                      </span>
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors font-sans capitalize"
                      >
                        <Search className="h-3 w-3 inline mr-2 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Search History */}
        {!hasSearched && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handleHistoryClick(query)}
                  className="px-3 py-2 bg-muted hover:bg-accent text-sm rounded-full transition-colors font-sans flex items-center gap-2"
                >
                  {query}
                  <X className="h-3 w-3 opacity-60" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-sans text-muted-foreground">Searching for "{searchQuery}"...</p>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="mb-6">
                  <h2 className="font-serif text-xl font-bold mb-2">
                    {searchResults.totalItems > 0 
                      ? `${searchResults.totalItems} results for "${searchQuery}"`
                      : `No results found for "${searchQuery}"`
                    }
                  </h2>
                  {searchResults.totalItems === 0 && (
                    <p className="font-sans text-muted-foreground">
                      Try adjusting your search terms or browse our categories.
                    </p>
                  )}
                </div>

                {/* Products Grid */}
                {searchResults.items.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                      {searchResults.items.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onClick={handleProductClick}
                          variant="default"
                          showActions={true}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {searchResults.totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex justify-center"
                      >
                        <Pagination
                          currentPage={searchResults.currentPage}
                          totalPages={searchResults.totalPages}
                          totalItems={searchResults.totalItems}
                          itemsPerPage={12}
                          onPageChange={handlePageChange}
                          showItemsInfo={true}
                        />
                      </motion.div>
                    )}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-6 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="mb-8 text-center">
            <div className="w-64 h-8 bg-muted animate-pulse rounded mx-auto mb-4"></div>
            <div className="w-96 h-4 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="w-full h-12 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full h-80 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Main SearchPage component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}