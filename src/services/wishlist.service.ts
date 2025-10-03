import { mockProducts } from '../data/products.data';
import { type Product } from '@/models/interfaces/product.interface';
import { MESSAGES } from '../constants/messages.constants';

export interface WishlistServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class WishlistService {
  private wishlistItems: Product[] = [];

  constructor() {
    // Initialize with some mock wishlist items - safe check for array
    try {
      this.wishlistItems = Array.isArray(mockProducts) ? mockProducts.slice(0, 6) : [];
    } catch (error) {
      console.warn('Failed to initialize wishlist items:', error);
      this.wishlistItems = [];
    }
  }

  /**
   * Get all wishlist items
   */
  async getWishlistItems(): Promise<WishlistServiceResponse<Product[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        data: [...this.wishlistItems],
        success: true,
        message: MESSAGES.WISHLIST.SUCCESS.FETCHED
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: MESSAGES.WISHLIST.ERROR.FETCH_FAILED
      };
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const numericProductId = parseInt(productId, 10);
      if (isNaN(numericProductId)) {
        return {
          data: false,
          success: false,
          message: 'Invalid product ID'
        };
      }

      // Check if item already exists
      const existingItem = this.wishlistItems.find(item => item.id === numericProductId);
      if (existingItem) {
        return {
          data: false,
          success: false,
          message: 'Item already in wishlist'
        };
      }

      // Find product in mock data
      const product = mockProducts.find(p => p.id === numericProductId);
      if (!product) {
        return {
          data: false,
          success: false,
          message: 'Product not found'
        };
      }

      this.wishlistItems.push(product);
      return {
        data: true,
        success: true,
        message: 'Item added to wishlist'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to add item to wishlist'
      };
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(productId: string): Promise<WishlistServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const numericProductId = parseInt(productId, 10);
      if (isNaN(numericProductId)) {
        return {
          data: false,
          success: false,
          message: 'Invalid product ID'
        };
      }

      const initialLength = this.wishlistItems.length;
      this.wishlistItems = this.wishlistItems.filter(item => item.id !== numericProductId);

      if (this.wishlistItems.length === initialLength) {
        return {
          data: false,
          success: false,
          message: 'Item not found in wishlist'
        };
      }

      return {
        data: true,
        success: true,
        message: 'Item removed from wishlist'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to remove item from wishlist'
      };
    }
  }

  /**
   * Clear all wishlist items
   */
  async clearWishlist(): Promise<WishlistServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.wishlistItems = [];
      return {
        data: true,
        success: true,
        message: 'Wishlist cleared successfully'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to clear wishlist'
      };
    }
  }

  /**
   * Get wishlist item count
   */
  getWishlistCount(): number {
    return this.wishlistItems.length;
  }

  /**
   * Check if item is in wishlist
   */
  isInWishlist(productId: string): boolean {
    const numericProductId = parseInt(productId, 10);
    if (isNaN(numericProductId)) {
      return false;
    }
    return this.wishlistItems.some(item => item.id === numericProductId);
  }

  /**
   * Move all items to cart
   */
  async moveAllToCart(): Promise<WishlistServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, this would add items to cart service
      // For now, we'll just clear the wishlist
      this.wishlistItems = [];
      
      return {
        data: true,
        success: true,
        message: 'All items moved to cart successfully'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to move items to cart'
      };
    }
  }
}

export const wishlistService = new WishlistService();