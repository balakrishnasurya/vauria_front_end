import { mockProducts } from '../data/products.data';
import { type Product } from '@/models/interfaces/product.interface';
import { MESSAGES } from '../constants/messages.constants';
import { httpService } from './http.service';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';

export interface CartItem extends Product {
  quantity: number;
  cartItemId?: number; // Add cart item ID for API operations
}

export interface CartServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

class CartService {
  private cartItems: CartItem[] = [];
  private cartCountListeners: ((count: number) => void)[] = [];
  private readonly CART_COUNT_KEY = 'vauria_cart_count';

  constructor() {
    // Initialize with empty cart
    this.cartItems = [];
    // Initialize cart from API when constructor runs
    this.initializeCart();
  }

  private async initializeCart() {
    if (typeof window !== 'undefined') {
      console.log('Initializing cart service...');
      try {
        // Load cart from API and update local state
        await this.refreshCartFromApi();
        console.log('Cart initialization completed successfully');
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        // Load cached count from localStorage as fallback
        const cachedCount = this.getCachedCartCount();
        console.log(`Using cached cart count as fallback: ${cachedCount}`);
        this.notifyCartCountListeners(cachedCount);
      }
    } else {
      console.log('Cart initialization skipped (SSR)');
    }
  }

  private async refreshCartFromApi(): Promise<void> {
    try {
      console.log('Refreshing cart from API...');
      const cartItems = await this.getCartFromApi();
      this.cartItems = cartItems;
      const count = this.getCartItemCount();
      console.log(`Cart refreshed from API. Items: ${cartItems.length}, Total count: ${count}`);
      this.notifyCartCountListeners(count);
    } catch (error) {
      console.error('Failed to refresh cart from API:', error);
      throw error;
    }
  }

  private getCachedCartCount(): number {
    if (typeof window === 'undefined') return 0; // SSR safety
    try {
      const cached = localStorage.getItem(this.CART_COUNT_KEY);
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  }

  private setCachedCartCount(count: number): void {
    if (typeof window === 'undefined') return; // SSR safety
    try {
      localStorage.setItem(this.CART_COUNT_KEY, count.toString());
    } catch {
      // Ignore localStorage errors
    }
  }

  private notifyCartCountListeners(count: number): void {
    console.log(`Notifying ${this.cartCountListeners.length} cart count listeners with count: ${count}`);
    
    // Cache the count in localStorage
    this.setCachedCartCount(count);
    
    // Notify all listeners
    this.cartCountListeners.forEach((listener, index) => {
      try {
        listener(count);
        console.log(`Successfully notified listener ${index}`);
      } catch (error) {
        console.error(`Error in cart count listener ${index}:`, error);
      }
    });
    
    console.log(`Cart count notification complete. Count: ${count}`);
  }

  public subscribeToCartCount(listener: (count: number) => void): () => void {
    console.log('New cart count subscription added');
    this.cartCountListeners.push(listener);
    
    // Immediately call with current count (use cached count if cart not loaded yet)
    const currentCount = this.cartItems.length > 0 ? this.getCartItemCount() : this.getCachedCartCount();
    console.log(`Immediately notifying new subscriber with count: ${currentCount}`);
    listener(currentCount);
    
    // Return unsubscribe function
    return () => {
      const index = this.cartCountListeners.indexOf(listener);
      if (index > -1) {
        this.cartCountListeners.splice(index, 1);
        console.log('Cart count subscription removed');
      }
    };
  }

  private mapApiCartItem(item: any): CartItem {
    const FALLBACK_IMAGE = 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/CHAINS.JPG';
    const productData = item.product;

    const rawImage = (productData.image_url ?? '').toString();
    const hasValidImage = rawImage && rawImage.toLowerCase() !== 'string';
    const imageUrl = hasValidImage ? rawImage : FALLBACK_IMAGE;

    const toNumber = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return {
      id: Number(productData.id),
      name: productData.name ?? '',
      slug: productData.slug ?? String(productData.id),
      description: productData.description ?? null,
      price: Number(productData.price ?? 0),
      offer_price: productData.offer_price != null ? Number(productData.offer_price) : null,
      stock: Number(productData.stock ?? 0),
      material: productData.material ?? null,
      weight: toNumber(productData.weight),
      dimensions: productData.dimensions ?? null,
      is_active: Boolean(productData.is_active),
      featured: Boolean(productData.featured),
      category_id: productData.category_id != null ? Number(productData.category_id) : null,
      image_url: imageUrl,
      created_at: productData.created_at ?? new Date().toISOString(),
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : [imageUrl],
      specifications: productData.specifications ?? undefined,
      care_instructions: productData.care_instructions ?? undefined,
      tags: productData.tags ?? undefined,
      quantity: Number(item.quantity),
      cartItemId: Number(item.id), // Store the cart item ID from the API
    };
  }

  public async getCartFromApi(): Promise<CartItem[]> {
    try {
      console.log('Fetching cart from API...');
      const res = await httpService.get(BACKEND_ROUTES.CART);
      console.log('Cart API response status:', res.status, res.statusText);
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log('Cart API: User not authenticated');
          return []; // Return empty cart for unauthenticated users
        }
        throw new Error(`Failed to fetch cart from API: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Cart API response data:', data);
      
      // The API returns an object with an 'items' array
      if (data && Array.isArray(data.items)) {
        console.log('Cart items found:', data.items.length);
        return data.items.map((item: any) => this.mapApiCartItem(item));
      }
      // If the top-level response is the cart itself
      if (data && Array.isArray(data)) {
        console.log('Cart array found:', data.length);
         return data.map((item: any) => this.mapApiCartItem(item));
      }
      console.log('No cart items found in API response');
      return [];
    } catch (error) {
      console.error('Error fetching cart from API:', error);
      return []; // Return empty cart on error
    }
  }

  /**
   * Get all cart items with summary
   */
  async getCartSummary(): Promise<CartServiceResponse<CartSummary>> {
    try {
      // Fetch latest cart from API
      await this.refreshCartFromApi();
      
      const subtotal = this.cartItems.reduce((sum, item) => {
        const itemPrice = item.offer_price || item.price;
        return sum + (itemPrice * item.quantity);
      }, 0);
      const shipping = subtotal > 5000 ? 0 : 200; // Free shipping above ₹5000
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + shipping + tax;
      const itemCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        data: {
          items: [...this.cartItems],
          subtotal,
          shipping,
          tax,
          total,
          itemCount
        },
        success: true,
        message: 'Cart fetched successfully'
      };
    } catch (error) {
      console.error('Error in getCartSummary:', error);
      return {
        data: {
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0
        },
        success: false,
        message: 'Failed to fetch cart'
      };
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number = 1): Promise<CartServiceResponse<boolean>> {
    try {
      console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
      
      // Try to add to cart via API
      const response = await httpService.post(BACKEND_ROUTES.CART_ITEMS, {
        product_id: parseInt(productId),
        quantity: quantity
      });

      if (response.ok) {
        console.log('Item added to cart via API successfully');
        
        // Force refresh cart from API to get latest state
        await this.refreshCartFromApi();
        
        return {
          data: true,
          success: true,
          message: 'Item added to cart successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add item via API:', errorData);
        return {
          data: false,
          success: false,
          message: errorData.message || 'Failed to add item to cart'
        };
      }
    } catch (error) {
      console.error('Error adding item to cart via API:', error);
      
      // Fallback to local cart management
      try {
        console.log('Using fallback local cart management');
        
        // Check if item already exists
        const existingItemIndex = this.cartItems.findIndex(item => String(item.id) === productId);
        
        if (existingItemIndex !== -1) {
          // Update quantity
          this.cartItems[existingItemIndex].quantity += quantity;
          const count = this.getCartItemCount();
          console.log(`Updated existing item quantity, new cart count: ${count}`);
          this.notifyCartCountListeners(count);
          return {
            data: true,
            success: true,
            message: 'Cart updated successfully'
          };
        }

        // Find product in mock data
        const product = mockProducts.find(p => String(p.id) === productId);
        if (!product) {
          return {
            data: false,
            success: false,
            message: 'Product not found'
          };
        }

        // Add new item
        this.cartItems.push({ ...product, quantity });
        const count = this.getCartItemCount();
        console.log(`Added new item to cart, new cart count: ${count}`);
        this.notifyCartCountListeners(count);
        return {
          data: true,
          success: true,
          message: 'Item added to cart'
        };
      } catch (fallbackError) {
        console.error('Fallback cart management failed:', fallbackError);
        return {
          data: false,
          success: false,
          message: 'Failed to add item to cart'
        };
      }
    }
  }

  /**
   * Update item quantity
   */
  async updateQuantity(productId: string, quantity: number): Promise<CartServiceResponse<boolean>> {
    try {
      console.log(`Updating quantity for product ${productId} to ${quantity}`);
      
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }

      // Find the cart item by product ID to get the cart item ID
      const cartItem = this.cartItems.find(item => String(item.id) === productId);
      
      if (!cartItem || !cartItem.cartItemId) {
        console.error(`Cart item not found for product ${productId}`);
        return {
          data: false,
          success: false,
          message: 'Item not found in cart'
        };
      }

      // Try to update quantity via API using the cart item ID
      const response = await httpService.patch(BACKEND_ROUTES.CART_ITEM_UPDATE(String(cartItem.cartItemId)), {
        quantity: quantity
      });

      if (response.ok) {
        console.log('Quantity updated via API successfully');
        
        // Force refresh cart from API to get latest state
        await this.refreshCartFromApi();
        
        return {
          data: true,
          success: true,
          message: 'Quantity updated successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update quantity via API:', errorData);
        return {
          data: false,
          success: false,
          message: errorData.message || 'Failed to update quantity'
        };
      }
    } catch (error) {
      console.error('Error updating quantity via API:', error);
      
      // Fallback to local cart management
      try {
        console.log('Using fallback local cart management for quantity update');
        
        const itemIndex = this.cartItems.findIndex(item => String(item.id) === productId);
        if (itemIndex === -1) {
          return {
            data: false,
            success: false,
            message: 'Item not found in cart'
          };
        }

        this.cartItems[itemIndex].quantity = quantity;
        const count = this.getCartItemCount();
        console.log(`Updated quantity locally, new cart count: ${count}`);
        this.notifyCartCountListeners(count);
        
        return {
          data: true,
          success: true,
          message: 'Quantity updated successfully'
        };
      } catch (fallbackError) {
        console.error('Fallback quantity update failed:', fallbackError);
        return {
          data: false,
          success: false,
          message: 'Failed to update quantity'
        };
      }
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<CartServiceResponse<boolean>> {
    try {
      console.log(`Removing product ${productId} from cart`);
      
      // Find the cart item by product ID to get the cart item ID
      const cartItem = this.cartItems.find(item => String(item.id) === productId);
      
      if (!cartItem || !cartItem.cartItemId) {
        console.error(`Cart item not found for product ${productId}`);
        return {
          data: false,
          success: false,
          message: 'Item not found in cart'
        };
      }

      // Try to remove from cart via API using the cart item ID
      const response = await httpService.delete(BACKEND_ROUTES.CART_ITEM_DELETE(String(cartItem.cartItemId)));

      if (response.ok) {
        console.log('Item removed from cart via API successfully');
        
        // Force refresh cart from API to get latest state
        await this.refreshCartFromApi();
        
        return {
          data: true,
          success: true,
          message: 'Item removed from cart successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to remove item via API:', errorData);
        return {
          data: false,
          success: false,
          message: errorData.message || 'Failed to remove item from cart'
        };
      }
    } catch (error) {
      console.error('Error removing item from cart via API:', error);
      
      // Fallback to local cart management
      try {
        console.log('Using fallback local cart management for item removal');
        
        const initialLength = this.cartItems.length;
        this.cartItems = this.cartItems.filter(item => String(item.id) !== productId);

        if (this.cartItems.length === initialLength) {
          return {
            data: false,
            success: false,
            message: 'Item not found in cart'
          };
        }

        const count = this.getCartItemCount();
        console.log(`Removed item locally, new cart count: ${count}`);
        this.notifyCartCountListeners(count);
        
        return {
          data: true,
          success: true,
          message: 'Item removed from cart'
        };
      } catch (fallbackError) {
        console.error('Fallback item removal failed:', fallbackError);
        return {
          data: false,
          success: false,
          message: 'Failed to remove item from cart'
        };
      }
    }
  }

  /**
   * Clear all cart items
   */
  async clearCart(): Promise<CartServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.cartItems = [];
      this.notifyCartCountListeners(0);
      return {
        data: true,
        success: true,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to clear cart'
      };
    }
  }

  /**
   * Get cart items
   */
  async getCartItems(): Promise<CartServiceResponse<CartItem[]>> {
    // TODO: Implement if needed
    return {
      data: [],
      success: true,
      message: 'Not implemented'
    };
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Force refresh cart from API and update all listeners
   */
  async forceRefreshCart(): Promise<void> {
    console.log('Force refreshing cart...');
    try {
      await this.refreshCartFromApi();
      console.log('Force refresh cart completed successfully');
    } catch (error) {
      console.error('Failed to force refresh cart:', error);
      // Still notify with current count even if refresh fails
      const count = this.getCartItemCount();
      console.log(`Force refresh failed, notifying with current count: ${count}`);
      this.notifyCartCountListeners(count);
    }
  }

  /**
   * Check if item is in cart
   */
  isInCart(productId: string): boolean {
    return this.cartItems.some(item => String(item.id) === productId);
  }

  /**
   * Move item to wishlist
   */
  async moveToWishlist(productId: string): Promise<CartServiceResponse<boolean>> {
    // TODO: Implement if needed
    return {
      data: false,
      success: false,
      message: 'Not implemented'
    };
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode: string): Promise<CartServiceResponse<{ discount: number; discountType: 'percentage' | 'fixed' }>> {
    // TODO: Implement if needed
    return {
      data: { discount: 0, discountType: 'fixed' },
      success: false,
      message: 'Not implemented'
    };
  }

  /**
   * Proceed to checkout
   */
  async checkout(shippingAddress: any, paymentMethod: any): Promise<CartServiceResponse<{ orderId: string }>> {
    // TODO: Implement if needed
    return {
      data: { orderId: '' },
      success: false,
      message: 'Not implemented'
    };
  }

  /**
   * Debug method to check cart status
   */
  debugCartStatus(): void {
    console.log('=== CART DEBUG STATUS ===');
    console.log('Cart items count:', this.cartItems.length);
    console.log('Cart items:', this.cartItems);
    console.log('Total quantity:', this.getCartItemCount());
    console.log('Listeners count:', this.cartCountListeners.length);
    console.log('Cached count:', this.getCachedCartCount());
    console.log('========================');
  }

}

export const cartService = new CartService();

// Debug: Expose cartService to window for testing (remove in production)
if (typeof window !== 'undefined') {
  (window as any).cartService = cartService;
  (window as any).debugCart = () => cartService.debugCartStatus();
  (window as any).refreshCart = () => cartService.forceRefreshCart();
}