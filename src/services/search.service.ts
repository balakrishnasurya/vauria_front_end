import { productService } from './product.service';
import { mockProducts } from '../data/products.data';
import { Product } from '@/models/interfaces/product.interface';

export interface PaginatedSearchResponse {
  items: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchService {
  searchProducts(query: string, options?: {
    page?: number;
    per_page?: number;
    limit?: number;
  }): Promise<Product[] | PaginatedSearchResponse>;
  getSearchSuggestions(query: string): Promise<string[]>;
  addToSearchHistory(query: string): Promise<void>;
  getSearchHistory(): Promise<string[]>;
  clearSearchHistory(): Promise<void>;
}

class SearchServiceImpl implements SearchService {
  private searchHistory: string[] = [];

  async searchProducts(query: string, options: {
    page?: number;
    per_page?: number;
    limit?: number;
  } = {}): Promise<Product[] | PaginatedSearchResponse> {
    if (!query.trim()) {
      return options.page ? {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      } : [];
    }

    // Add to search history
    await this.addToSearchHistory(query);

    // Use the existing product service search which handles both data sources
    let results = await productService.searchProducts(query);
    
    // If no results found, try searching in mockProducts directly
    if (results.length === 0) {
      const searchTerm = query.toLowerCase().trim();
      const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
      
      results = mockProducts.filter(p => {
        if (p.stock === 0) return false;
        
        const searchableText = [
          p.name.toLowerCase(),
          (p.description || '').toLowerCase(),
          (p.material || '').toLowerCase(),
          Object.values(p.specifications || {}).join(' ').toLowerCase()
        ].join(' ');
        
        return searchWords.every(word => searchableText.includes(word)) ||
               searchableText.includes(searchTerm);
      });
    }
    
    // If pagination options are provided, return paginated response
    if (options.page || options.per_page || options.limit) {
      const {
        page = 1,
        per_page = 20,
        limit
      } = options;

      const itemsPerPage = per_page || limit || 12;
      const totalItems = results.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = results.slice(startIndex, endIndex);

      return {
        items: paginatedResults,
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    }
    
    return results;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const products = await productService.getProducts();
    const suggestions = new Set<string>();
    const searchTerm = query.toLowerCase();

    // Common jewelry search terms and categories
    const commonTerms = [
      'rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'chains',
      'diamond', 'gold', 'silver', 'platinum', 'sapphire', 'ruby', 'emerald',
      'engagement', 'wedding', 'anniversary', 'vintage', 'modern', 'classic',
      'luxury', 'premium', 'handcrafted', 'custom', 'designer'
    ];

    // Add matching common terms
    commonTerms.forEach(term => {
      if (term.includes(searchTerm) && term !== searchTerm) {
        suggestions.add(term);
      }
    });

    // Extract suggestions from product data
    products.forEach(product => {
      // Check product names
      const nameWords = product.name.toLowerCase().split(' ');
      nameWords.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.includes(searchTerm) && cleanWord !== searchTerm && cleanWord.length > 2) {
          suggestions.add(cleanWord);
        }
      });

      // Check materials
      if (product.material) {
        const material = product.material.toLowerCase();
        if (material.includes(searchTerm) && material !== searchTerm) {
          suggestions.add(material);
        }
      }

      // Check specifications
      if (product.specifications) {
        Object.values(product.specifications).forEach(spec => {
          const specLower = spec.toLowerCase();
          if (specLower.includes(searchTerm) && specLower !== searchTerm) {
            suggestions.add(specLower);
          }
        });
      }

      // Check tags
      if (product.tags) {
        product.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes(searchTerm) && tagLower !== searchTerm) {
            suggestions.add(tagLower);
          }
        });
      }

    });

    // Convert to array, prioritize exact word matches, and limit results
    const suggestionArray = Array.from(suggestions);
    const exactMatches = suggestionArray.filter(s => s.startsWith(searchTerm));
    const partialMatches = suggestionArray.filter(s => !s.startsWith(searchTerm));
    
    return [...exactMatches, ...partialMatches].slice(0, 8);
  }

  async addToSearchHistory(query: string): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(q => q !== trimmedQuery);
    
    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);
    
    // Keep only last 10 searches
    this.searchHistory = this.searchHistory.slice(0, 10);
  }

  async getSearchHistory(): Promise<string[]> {
    return [...this.searchHistory];
  }

  async clearSearchHistory(): Promise<void> {
    this.searchHistory = [];
  }
}

export const searchService = new SearchServiceImpl();