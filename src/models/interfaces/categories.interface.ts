/**
 * Category-related interfaces for Vauria Jewelry Application
 * Contains all type definitions for categories, products, filters, and pagination
 */

// Basic Category Interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  parent_id?: number | null; // For subcategories
  children?: Category[]; // For parent categories with subcategories
}

// Product Interface
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: string;
  categorySlug: string;
  description?: string;
  specifications?: ProductSpecifications;
  availability: 'in-stock' | 'out-of-stock' | 'limited';
  tags?: string[];
  material?: string;
  weight?: number;
  dimensions?: string;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
}

// Product Specifications
export interface ProductSpecifications {
  material: string;
  weight: string;
  dimensions: string;
  purity?: string;
  gemstone?: string;
  occasion?: string[];
  care?: string[];
}

// Filter Options
export interface FilterOptions {
  priceRanges?: PriceRange[];
  materials?: string[];
  rating?: number[];
  availability?: ('in-stock' | 'out-of-stock' | 'limited')[];
}

// Price Range for filtering
export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

// Sort Options
export type SortOption = 'featured' | 'price-low-high' | 'price-high-low' | 'newest' | 'rating' | 'name-a-z' | 'name-z-a';

// Category Query Parameters
export interface CategoryQueryParams {
  page?: number;
  per_page?: number;
  sortBy?: SortOption;
  filters?: {
    priceRange?: string[];
    materials?: string[];
    rating?: number[];
    availability?: string[];
  };
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Category Service Response
export interface CategoryServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Category Statistics
export interface CategoryStats {
  totalProducts: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  topMaterials: string[];
  averageRating: number;
}

// Category Page Props
export interface CategoryPageProps {
  categorySlug: string;
  onBackToHome: () => void;
  onProductClick?: (productSlug: string) => void;
}

// Category Navigation Item (for Header)
export interface CategoryNavItem {
  id: number;
  name: string;
  slug: string;
  children?: CategoryNavItem[];
  hasDropdown?: boolean;
}

// Category Breadcrumb
export interface CategoryBreadcrumb {
  name: string;
  slug: string;
  url: string;
}

// Category SEO Data
export interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl: string;
}