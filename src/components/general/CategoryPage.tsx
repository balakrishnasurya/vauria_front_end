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
import { cartService } from '@/services/cart.service';
import { type Product, type SortOption, type FilterOptions } from '@/data/products.data';
import { type Category } from '@/models/interfaces/categories.interface';
import { Pagination } from './Pagination';
import { ProductCard } from './ProductCard';
import { PRODUCT_MESSAGES } from '@/constants/product.messages';
import { toast } from 'sonner';

interface CategoryPageProps {
  categorySlug: string;
  onBackToHome: () => void;
  onProductClick?: (productSlug: string) => void;
}

export function CategoryPage({ 
  categorySlug,
  onBackToHome, 
  onProductClick
}: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<PaginatedResponse<Product>>({
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>({});

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await cartService.addToCart(productId, 1);
      if (response.success) {
        toast.success(PRODUCT_MESSAGES.ADDED_TO_CART);
      } else {
        toast.error(response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };





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

      // Load products
      const productsResponse = await categoryService.getCategoryProducts(categorySlug, {
        page: 1,
        per_page: 12,
        sortBy,
        filters
      });
      
      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
      
      setLoading(false);
    };

    loadCategoryData();
  }, [categorySlug]);

  // Reload products when sort or filters change
  useEffect(() => {
    const loadProducts = async () => {
      const response = await categoryService.getCategoryProducts(categorySlug, {
        page: products.currentPage,
        per_page: 12,
        sortBy,
        filters
      });
      
      if (response.success) {
        setProducts(response.data);
      }
    };

    if (category) {
      loadProducts();
    }
  }, [categorySlug, sortBy, filters, category]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handlePageChange = async (page: number) => {
    const response = await categoryService.getCategoryProducts(categorySlug, {
      page,
      per_page: 12,
      sortBy,
      filters
    });
    
    if (response.success) {
      setProducts(response.data);
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
          <Button onClick={onBackToHome}>Back to Home</Button>
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
            onClick={onBackToHome}
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
              {products.totalItems} {products.totalItems === 1 ? 'product' : 'products'}
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
                        {filterOptions.priceRanges.map(range => (
                          <label key={`price-${range.min}-${range.max}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tempFilters.priceRange?.includes(range.label) || false}
                              onChange={(e) => {
                                const current = tempFilters.priceRange || [];
                                if (e.target.checked) {
                                  setTempFilters({
                                    ...tempFilters,
                                    priceRange: [...current, range.label]
                                  });
                                } else {
                                  setTempFilters({
                                    ...tempFilters,
                                    priceRange: current.filter(p => p !== range.label)
                                  });
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
                        {filterOptions.materials.map(material => (
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
                                    materials: current.filter(m => m !== material)
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
                        {filterOptions.ratings.map(rating => (
                          <label key={`rating-${rating}`} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tempFilters.rating?.includes(rating) || false}
                              onChange={(e) => {
                                const current = tempFilters.rating || [];
                                if (e.target.checked) {
                                  setTempFilters({
                                    ...tempFilters,
                                    rating: [...current, rating]
                                  });
                                } else {
                                  setTempFilters({
                                    ...tempFilters,
                                    rating: current.filter(r => r !== rating)
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
                onClick={onProductClick}
                onAddToCartClick={handleAddToCart}
                variant="default"
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {products.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8"
          >
            <Pagination
              currentPage={products.currentPage}
              totalPages={products.totalPages}
              totalItems={products.totalItems}
              itemsPerPage={12}
              onPageChange={handlePageChange}
              showItemsInfo={true}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}