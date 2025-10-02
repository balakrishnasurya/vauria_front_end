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

  constructor() {
    // Initialize with some mock cart items - this will be replaced by API call
    this.cartItems = [];
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
      const res = await httpService.get(BACKEND_ROUTES.CART);
      if (!res.ok) {
        throw new Error(`Failed to fetch cart from API: ${res.statusText}`);
      }
      const data = await res.json();
      // The API returns an object with an 'items' array
      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any) => this.mapApiCartItem(item));
      }
      // If the top-level response is the cart itself
      if (data && Array.isArray(data)) {
         return data.map((item: any) => this.mapApiCartItem(item));
      }
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
      // Fetch items from the API
      this.cartItems = await this.getCartFromApi();
      
      const subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
      // Try to add to cart via API
      const response = await httpService.post(BACKEND_ROUTES.CART_ITEMS, {
        product_id: parseInt(productId),
        quantity: quantity
      });

      if (response.ok) {
        const data = await response.json();
        // Update local cart items with the response
        if (data && Array.isArray(data.items)) {
          this.cartItems = data.items.map((item: any) => this.mapApiCartItem(item));
        }
        return {
          data: true,
          success: true,
          message: 'Item added to cart successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
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
        // Check if item already exists
        const existingItemIndex = this.cartItems.findIndex(item => String(item.id) === productId);
        
        if (existingItemIndex !== -1) {
          // Update quantity
          this.cartItems[existingItemIndex].quantity += quantity;
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
        return {
          data: true,
          success: true,
          message: 'Item added to cart'
        };
      } catch (fallbackError) {
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
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }

      // Find the cart item by product ID to get the cart item ID
      const cartItem = this.cartItems.find(item => String(item.id) === productId);
      
      if (!cartItem || !cartItem.cartItemId) {
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
        // Update local cart item quantity
        const itemIndex = this.cartItems.findIndex(item => String(item.id) === productId);
        if (itemIndex !== -1) {
          this.cartItems[itemIndex].quantity = quantity;
        }
        return {
          data: true,
          success: true,
          message: 'Quantity updated successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
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
        const itemIndex = this.cartItems.findIndex(item => String(item.id) === productId);
        if (itemIndex === -1) {
          return {
            data: false,
            success: false,
            message: 'Item not found in cart'
          };
        }

        this.cartItems[itemIndex].quantity = quantity;
        return {
          data: true,
          success: true,
          message: 'Quantity updated successfully'
        };
      } catch (fallbackError) {
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
      // Find the cart item by product ID to get the cart item ID
      const cartItem = this.cartItems.find(item => String(item.id) === productId);
      
      if (!cartItem || !cartItem.cartItemId) {
        return {
          data: false,
          success: false,
          message: 'Item not found in cart'
        };
      }

      // Try to remove from cart via API using the cart item ID
      const response = await httpService.delete(BACKEND_ROUTES.CART_ITEM_DELETE(String(cartItem.cartItemId)));

      if (response.ok) {
        // Update local cart items by removing the item
        this.cartItems = this.cartItems.filter(item => String(item.id) !== productId);
        return {
          data: true,
          success: true,
          message: 'Item removed from cart successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
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
        const initialLength = this.cartItems.length;
        this.cartItems = this.cartItems.filter(item => String(item.id) !== productId);

        if (this.cartItems.length === initialLength) {
          return {
            data: false,
            success: false,
            message: 'Item not found in cart'
          };
        }

        return {
          data: true,
          success: true,
          message: 'Item removed from cart'
        };
      } catch (fallbackError) {
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
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        data: [...this.cartItems],
        success: true,
        message: 'Cart items fetched successfully'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to fetch cart items'
      };
    }
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Remove from cart
      const removeResult = await this.removeFromCart(productId);
      if (!removeResult.success) {
        return removeResult;
      }

      // In a real app, this would call wishlist service
      return {
        data: true,
        success: true,
        message: 'Item moved to wishlist'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to move item to wishlist'
      };
    }
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode: string): Promise<CartServiceResponse<{ discount: number; discountType: 'percentage' | 'fixed' }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock coupon validation
      const mockCoupons: Record<string, { discount: number; discountType: 'percentage' | 'fixed' }> = {
        'SAVE10': { discount: 10, discountType: 'percentage' },
        'FLAT500': { discount: 500, discountType: 'fixed' },
        'WELCOME15': { discount: 15, discountType: 'percentage' }
      };

      const coupon = mockCoupons[couponCode.toUpperCase()];
      if (!coupon) {
        return {
          data: { discount: 0, discountType: 'fixed' },
          success: false,
          message: 'Invalid coupon code'
        };
      }

      return {
        data: coupon,
        success: true,
        message: 'Coupon applied successfully'
      };
    } catch (error) {
      return {
        data: { discount: 0, discountType: 'fixed' },
        success: false,
        message: 'Failed to apply coupon'
      };
    }
  }

  /**
   * Proceed to checkout
   */
  async checkout(shippingAddress: any, paymentMethod: any): Promise<CartServiceResponse<{ orderId: string }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.cartItems.length === 0) {
        return {
          data: { orderId: '' },
          success: false,
          message: 'Cart is empty'
        };
      }

      // Generate mock order ID
      const orderId = `ORD-${Date.now()}`;
      
      // Clear cart after successful checkout
      this.cartItems = [];

      return {
        data: { orderId },
        success: true,
        message: 'Order placed successfully'
      };
    } catch (error) {
      return {
        data: { orderId: '' },
        success: false,
        message: 'Checkout failed'
      };
    }
  }
}

export const cartService = new CartService();