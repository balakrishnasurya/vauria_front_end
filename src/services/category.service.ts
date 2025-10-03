import { 
  categoryMockData
} from '@/data/products.data';
import { 
  type Product, 
  type CategoryProducts, 
  type SortOption, 
  type FilterOptions 
} from '@/models/interfaces/product.interface';
import { 
  mockCategories, 
  getAllCategories, 
  getCategoryBySlug as getCategoryBySlugFromData,
  getMainCategories
} from '@/data/categories.data';
import { 
  type Category 
} from '@/models/interfaces/categories.interface';
import { MESSAGES } from '../constants/messages.constants';

export interface CategoryServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class CategoryService {
  private categories: Category[] = mockCategories;
  private categoryProducts: CategoryProducts = categoryMockData.categoryProducts;

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoryServiceResponse<Category[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        data: this.categories,
        success: true,
        message: MESSAGES.CATEGORY.SUCCESS.CATEGORIES_FETCHED
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: MESSAGES.CATEGORY.ERROR.CATEGORIES_FETCH_FAILED
      };
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryServiceResponse<Category | null>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const category = getCategoryBySlugFromData(slug);
      
      return {
        data: category || null,
        success: true,
        message: category ? MESSAGES.CATEGORY.SUCCESS.CATEGORY_FOUND : MESSAGES.CATEGORY.ERROR.CATEGORY_NOT_FOUND
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to fetch category'
      };
    }
  }

  /**
   * Get products for a category with filtering, sorting, and pagination
   */
  async getCategoryProducts(
    categorySlug: string,
    options: {
      page?: number;
      per_page?: number;
      limit?: number;
      category_id?: number | null;
      sortBy?: SortOption;
      filters?: FilterOptions;
    } = {}
  ): Promise<CategoryServiceResponse<PaginatedResponse<Product>>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const {
        page = 1,
        per_page = 20,
        limit,
        category_id,
        sortBy = 'featured',
        filters = {}
      } = options;

      // Use per_page if provided, otherwise fall back to limit, then default
      const itemsPerPage = per_page || limit || 12;

      let products = this.categoryProducts[categorySlug] || [];

      // Apply filters
      products = this.applyFilters(products, filters);

      // Apply sorting
      products = this.applySorting(products, sortBy);

      // Calculate pagination
      const totalItems = products.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = products.slice(startIndex, endIndex);

      const paginatedResponse: PaginatedResponse<Product> = {
        items: paginatedProducts,
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };

      return {
        data: paginatedResponse,
        success: true,
        message: MESSAGES.CATEGORY.SUCCESS.PRODUCTS_FETCHED
      };
    } catch (error) {
      return {
        data: {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false
        },
        success: false,
        message: 'Failed to fetch category products'
      };
    }
  }

  /**
   * Get available sort options
   */
  getSortOptions(): SortOption[] {
    return [
      'featured',
      'price-low-high',
      'price-high-low',
      'newest',
      'popularity',
      'rating'
    ];
  }

  /**
   * Get available filter options for a category
   */
  async getFilterOptions(categorySlug: string): Promise<CategoryServiceResponse<FilterOptions>> {
    try {
      const products = this.categoryProducts[categorySlug] || [];
      
      // Extract unique values for filters
      const priceRanges = [
        { min: 0, max: 5000, label: 'Under ₹5,000' },
        { min: 5000, max: 15000, label: '₹5,000 - ₹15,000' },
        { min: 15000, max: 30000, label: '₹15,000 - ₹30,000' },
        { min: 30000, max: 50000, label: '₹30,000 - ₹50,000' },
        { min: 50000, max: Infinity, label: 'Above ₹50,000' }
      ];

      const materials = [...new Set(products.flatMap(p => p.material || []))];
      // For now, we'll use empty arrays for colors and sizes since these properties don't exist in Product interface
      const colors: string[] = [];
      const sizes: string[] = [];

      return {
        data: {
          priceRanges,
          materials,
          colors,
          sizes,
          ratings: [] // Ratings removed from business requirements
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          priceRanges: [],
          materials: [],
          colors: [],
          sizes: [],
          ratings: [] // Ratings not supported
        },
        success: false,
        message: 'Failed to fetch filter options'
      };
    }
  }

  /**
   * Apply filters to products
   */
  private applyFilters(products: Product[], filters: FilterOptions): Product[] {
    return products.filter(product => {
      // Price range filter
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (product.price < min || product.price > max) {
          return false;
        }
      }

      // Material filter
      if (filters.materials && filters.materials.length > 0) {
        if (!product.material || !filters.materials.some(m => product.material?.includes(m))) {
          return false;
        }
      }

      // Color filter
      // Color filter disabled since Product interface doesn't have color property
      // if (filters.colors && filters.colors.length > 0) {
      //   if (!product.color || !filters.colors.some(c => product.color?.includes(c))) {
      //     return false;
      //   }
      // }

      // Size filter
      // Size filter disabled since Product interface doesn't have size property
      // if (filters.sizes && filters.sizes.length > 0) {
      //   if (!product.size || !filters.sizes.some(s => product.size?.includes(s))) {
      //     return false;
      //   }
      // }

      // Rating filter removed - no longer supported

      return true;
    });
  }

  /**
   * Apply sorting to products
   */
  private applySorting(products: Product[], sortBy: SortOption): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-high-low':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      
      case 'popularity':
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      
      case 'rating':
        return sorted; // Rating sort removed - fallback to default
      
      case 'featured':
      default:
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }

  /**
   * Search products within a category
   */
  async searchCategoryProducts(
    categorySlug: string,
    searchQuery: string,
    options: {
      page?: number;
      per_page?: number;
      limit?: number;
      sortBy?: SortOption;
    } = {}
  ): Promise<CategoryServiceResponse<PaginatedResponse<Product>>> {
    try {
      const products = this.categoryProducts[categorySlug] || [];
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const { page = 1, per_page = 20, limit, sortBy = 'featured' } = options;
      const itemsPerPage = per_page || limit || 12;
      const sortedProducts = this.applySorting(filteredProducts, sortBy);

      const totalItems = sortedProducts.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

      return {
        data: {
          items: paginatedProducts,
          totalItems,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        success: true,
        message: `Found ${totalItems} products matching "${searchQuery}"`
      };
    } catch (error) {
      return {
        data: {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false
        },
        success: false,
        message: 'Search failed'
      };
    }
  }
}

export const categoryService = new CategoryService();