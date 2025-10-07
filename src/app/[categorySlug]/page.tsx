'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { 
  ArrowLeft,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { categoryService, type PaginatedResponse } from '@/services/category.service';
import { productService, type PaginatedProductResponse } from '@/services/product.service';
import { type Product, type SortOption, type FilterOptions } from '@/models/interfaces/product.interface';
import { type Category } from '@/models/interfaces/categories.interface';
import { Pagination } from '@/components/general/Pagination';
import { ProductCard } from '@/components/general/ProductCard';
import { useMainContext } from '@/context/MainContext';
import { mockCategories } from '@/data/categories.data';

interface CategoryPageProps {
  params: {
    categorySlug: string;
  };
}

// Helper function to get category ID from slug
const getCategoryIdFromSlug = (slug: string): number | null => {
  // First check direct match
  const directMatch = mockCategories.find(cat => cat.slug === slug);
  if (directMatch) return directMatch.id;
  
  // Check children categories
  for (const category of mockCategories) {
    if (category.children) {
      const childMatch = category.children.find(child => child.slug === slug);
      if (childMatch) return childMatch.id;
    }
  }
  
  return null;
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = params;
  const { handleLogoClick, handleProductClick } = useMainContext();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<PaginatedProductResponse>({
    items: [],
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>({});





  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Load category and initial products
  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      
      // Load category details
      const categoryResponse = await categoryService.getCategoryBySlug(categorySlug);
      if (categoryResponse.success && categoryResponse.data) {
        setCategory(categoryResponse.data);
      }

      // Load filter options
      const filterResponse = await categoryService.getFilterOptions(categorySlug);
      if (filterResponse.success) {
        setFilterOptions(filterResponse.data);
      }

      // Load products using API with category ID
      const categoryId = getCategoryIdFromSlug(categorySlug);
      if (categoryId) {
        try {
          const apiResponse = await productService.getProductsFromApi({ 
            category_id: categoryId,
            per_page: 12,
            page: 1
          });
          
          setProducts(apiResponse);
        } catch (error) {
          console.error('Failed to load products from API:', error);
          // Fallback to category service
          const productsResponse = await categoryService.getCategoryProducts(categorySlug, {
            page: 1,
            per_page: 12,
            sortBy,
            filters
          });
          
          if (productsResponse.success) {
            // Convert legacy format to new format
            const legacyData = productsResponse.data;
            setProducts({
              items: legacyData.items,
              page: legacyData.currentPage,
              per_page: 12,
              total: legacyData.totalItems,
              total_pages: legacyData.totalPages,
              has_next: legacyData.hasNextPage,
              has_prev: legacyData.hasPreviousPage
            });
          }
        }
      } else {
        // Fallback to category service if category ID not found
        const productsResponse = await categoryService.getCategoryProducts(categorySlug, {
          page: 1,
          per_page: 12,
          sortBy,
          filters
        });
        
        if (productsResponse.success) {
          // Convert legacy format to new format
          const legacyData = productsResponse.data;
          setProducts({
            items: legacyData.items,
            page: legacyData.currentPage,
            per_page: 12,
            total: legacyData.totalItems,
            total_pages: legacyData.totalPages,
            has_next: legacyData.hasNextPage,
            has_prev: legacyData.hasPreviousPage
          });
        }
      }
      
      setLoading(false);
    };

    loadCategoryData();
  }, [categorySlug]);

  // Reload products when sort or filters change
  useEffect(() => {
    const loadProducts = async () => {
      const categoryId = getCategoryIdFromSlug(categorySlug);
      
      if (categoryId) {
        try {
          const apiResponse = await productService.getProductsFromApi({ 
            category_id: categoryId,
            per_page: 12,
            page: products.page
          });
          
          setProducts(apiResponse);
        } catch (error) {
          console.error('Failed to reload products from API:', error);
          // Fallback to category service
          const response = await categoryService.getCategoryProducts(categorySlug, {
            page: products.page,
            per_page: 12,
            sortBy,
            filters
          });
          
          if (response.success) {
            // Convert legacy format to new format
            const legacyData = response.data;
            setProducts({
              items: legacyData.items,
              page: legacyData.currentPage,
              per_page: 12,
              total: legacyData.totalItems,
              total_pages: legacyData.totalPages,
              has_next: legacyData.hasNextPage,
              has_prev: legacyData.hasPreviousPage
            });
          }
        }
      } else {
        // Fallback to category service
        const response = await categoryService.getCategoryProducts(categorySlug, {
          page: products.page,
          per_page: 12,
          sortBy,
          filters
        });
        
        if (response.success) {
          // Convert legacy format to new format
          const legacyData = response.data;
          setProducts({
            items: legacyData.items,
            page: legacyData.currentPage,
            per_page: 12,
            total: legacyData.totalItems,
            total_pages: legacyData.totalPages,
            has_next: legacyData.hasNextPage,
            has_prev: legacyData.hasPreviousPage
          });
        }
      }
    };

    if (category) {
      loadProducts();
    }
  }, [categorySlug, sortBy, filters, category, products.page]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handlePageChange = async (page: number) => {
    const categoryId = getCategoryIdFromSlug(categorySlug);
    
    if (categoryId) {
      try {
        const apiResponse = await productService.getProductsFromApi({ 
          category_id: categoryId,
          per_page: 12,
          page
        });
        
        setProducts(apiResponse);
      } catch (error) {
        console.error('Failed to change page with API:', error);
        // Fallback to category service
        const response = await categoryService.getCategoryProducts(categorySlug, {
          page,
          per_page: 12,
          sortBy,
          filters
        });
        
        if (response.success) {
          // Convert legacy format to new format
          const legacyData = response.data;
          setProducts({
            items: legacyData.items,
            page: legacyData.currentPage,
            per_page: 12,
            total: legacyData.totalItems,
            total_pages: legacyData.totalPages,
            has_next: legacyData.hasNextPage,
            has_prev: legacyData.hasPreviousPage
          });
        }
      }
    } else {
      // Fallback to category service
      const response = await categoryService.getCategoryProducts(categorySlug, {
        page,
        per_page: 12,
        sortBy,
        filters
      });
      
      if (response.success) {
        // Convert legacy format to new format
        const legacyData = response.data;
        setProducts({
          items: legacyData.items,
          page: legacyData.currentPage,
          per_page: 12,
          total: legacyData.totalItems,
          total_pages: legacyData.totalPages,
          has_next: legacyData.hasNextPage,
          has_prev: legacyData.hasPreviousPage
        });
      }
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setFilters({});
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Category Not Found</h1>
          <Button onClick={handleLogoClick}>Back to Home</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
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

        {/* Category Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="relative h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mb-6">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                <p className="font-sans text-lg md:text-xl">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <span className="font-sans text-muted-foreground">
              {products.total} {products.total === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-2 bg-input border border-border rounded-lg font-sans text-sm focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 font-sans">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="font-serif">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Price Range Filter */}
                  {filterOptions.priceRanges && (
                    <div>
                      <h3 className="font-serif font-medium mb-3">Price Range</h3>
                      <div className="space-y-2">
                        {filterOptions.priceRanges.map((range: { min: number; max: number | null; label: string }) => (
                          <label key={`price-${range.min}-${range.max}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tempFilters.priceRange?.label === range.label}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempFilters({
                                    ...tempFilters,
                                    priceRange: { 
                                      min: Number.isFinite(range.min) ? range.min : 0, 
                                      max: Number.isFinite(range.max as number) ? (range.max as number) : Number.MAX_SAFE_INTEGER, 
                                      label: range.label 
                                    }
                                  });
                                } else {
                                  // Only clear if currently selected range matches
                                  if (tempFilters.priceRange?.label === range.label) {
                                    const { priceRange, ...rest } = tempFilters as any;
                                    setTempFilters(rest);
                                  }
                                }
                              }}
                              className="rounded"
                            />
                            <span className="font-sans text-sm">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material Filter */}
                  {filterOptions.materials && (
                    <div>
                      <h3 className="font-serif font-medium mb-3">Material</h3>
                      <div className="space-y-2">
                        {filterOptions.materials.map((material: string) => (
                          <label key={`material-${material}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tempFilters.materials?.includes(material) || false}
                              onChange={(e) => {
                                const current = tempFilters.materials || [];
                                if (e.target.checked) {
                                  setTempFilters({
                                    ...tempFilters,
                                    materials: [...current, material]
                                  });
                                } else {
                                  setTempFilters({
                                    ...tempFilters,
                                    materials: current.filter((m: string) => m !== material)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="font-sans text-sm">{material}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating Filter */}
                  {filterOptions.ratings && (
                    <div>
                      <h3 className="font-serif font-medium mb-3">Rating</h3>
                      <div className="space-y-2">
                        {filterOptions.ratings.map((rating: number) => (
                          <label key={`rating-${rating}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tempFilters.ratings?.includes(rating) || false}
                              onChange={(e) => {
                                const current = tempFilters.ratings || [] as number[];
                                if (e.target.checked) {
                                  setTempFilters({
                                    ...tempFilters,
                                    ratings: [...current, rating]
                                  });
                                } else {
                                  setTempFilters({
                                    ...tempFilters,
                                    ratings: current.filter((r: number) => r !== rating)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span>& up</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex-1 font-sans"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Products Grid */}
        {products.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <h2 className="font-serif text-xl font-bold mb-2">No products found</h2>
            <p className="font-sans text-muted-foreground mb-6">
              Try adjusting your filters or search criteria
            </p>
            <Button
              onClick={handleClearFilters}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {products.items.map((product, index) => (
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
        )}

        {/* Pagination */}
        {products.total_pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8"
          >
            <Pagination
              currentPage={products.page}
              totalPages={products.total_pages}
              totalItems={products.total}
              itemsPerPage={products.per_page}
              onPageChange={handlePageChange}
              showItemsInfo={true}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}