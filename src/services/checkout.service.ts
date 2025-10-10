import { mockUsers } from '@/data/products.data';
import { type Address, type PaymentMethod, type CheckoutData, type User } from '@/models/interfaces/product.interface';
import { MESSAGES } from '@/constants/messages.constants';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';
import { httpService } from './http.service';

export interface CheckoutServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ShippingCalculation {
  standard: { cost: number; days: string; };
  express: { cost: number; days: string; };
}

export interface ShippingRate {
  courier_id: number;
  courier_name: string;
  rate: number;
  etd: string;
}

export interface ShippingRatesRequest {
  address_id: number;
  total_weight: number;
  total_amount: number;
  payment_method: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingMethod: 'standard' | 'express';
}

export interface Discount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

class CheckoutService {
  private currentUserId: string = 'customer-1'; // Mock current user

  /**
   * Get user addresses (deprecated - use profileService.getUserAddresses)
   */
  async getUserAddresses(): Promise<CheckoutServiceResponse<Address[]>> {
    return {
      data: [],
      success: false,
      message: 'This method is deprecated. Use profileService.getUserAddresses instead.'
    };
  }

  /**
   * Add new address (deprecated - use profileService.addAddress)
   */
  async addAddress(address: Omit<Address, 'id'>): Promise<CheckoutServiceResponse<Address>> {
    return {
      data: {} as Address,
      success: false,
      message: 'This method is deprecated. Use profileService.addAddress instead.'
    };
  }

  /**
   * Update address (deprecated - use profileService.updateAddress)
   */
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<CheckoutServiceResponse<Address>> {
    return {
      data: {} as Address,
      success: false,
      message: 'This method is deprecated. Use profileService.updateAddress instead.'
    };
  }

  /**
   * Delete address (deprecated - use profileService.deleteAddress)
   */
  async deleteAddress(addressId: string): Promise<CheckoutServiceResponse<boolean>> {
    return {
      data: false,
      success: false,
      message: 'This method is deprecated. Use profileService.deleteAddress instead.'
    };
  }

  /**
   * Get user payment methods (deprecated - not implemented for real API)
   */
  async getUserPaymentMethods(): Promise<CheckoutServiceResponse<PaymentMethod[]>> {
    return {
      data: [],
      success: false,
      message: 'Payment methods are handled through payment gateway directly.'
    };
  }

  /**
   * Add payment method (deprecated - not implemented for real API)
   */
  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<CheckoutServiceResponse<PaymentMethod>> {
    return {
      data: {} as PaymentMethod,
      success: false,
      message: 'Payment methods are handled through payment gateway directly.'
    };
  }

  /**
   * Get real-time shipping rates from API
   */
  async getShippingRates(
    addressId: number, 
    totalWeight: number, 
    totalAmount: number, 
    paymentMethod: string
  ): Promise<CheckoutServiceResponse<ShippingRate[]>> {
    try {
      const requestBody = {
        address_id: addressId,
        total_weight: totalWeight,
        total_amount: totalAmount,
        payment_method: paymentMethod
      };

      const response = await httpService.post(BACKEND_ROUTES.SHIPPING_RATES, requestBody);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch shipping rates';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          console.error('Error parsing shipping rates API error response:', parseError);
        }
        
        return {
          data: [],
          success: false,
          message: errorMessage
        };
      }

      const shippingRates: ShippingRate[] = await response.json();
      
      return {
        data: shippingRates,
        success: true,
        message: 'Shipping rates fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to fetch shipping rates. Please check your connection and try again.'
      };
    }
  }

  /**
   * Calculate shipping options (deprecated - fallback method)
   */
  async calculateShipping(address: Address): Promise<CheckoutServiceResponse<ShippingCalculation>> {
    // Method deprecated - use getShippingRates instead
    return {
      data: {
        standard: { cost: 0, days: 'N/A' },
        express: { cost: 0, days: 'N/A' }
      },
      success: false,
      message: 'This shipping calculation method is deprecated. Please use real-time shipping rates.'
    };
  }

  /**
   * Validate checkout data
   */
  async validateCheckout(checkoutData: CheckoutData): Promise<CheckoutServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Validate address
      if (!checkoutData.shippingAddress.street || !checkoutData.shippingAddress.city || 
          !checkoutData.shippingAddress.pincode) {
        return {
          data: false,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.INVALID_ADDRESS
        };
      }

      // Validate payment method
      if (!checkoutData.paymentMethod.type) {
        return {
          data: false,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.INVALID_PAYMENT_METHOD
        };
      }

      return {
        data: true,
        success: true,
        message: 'Checkout data is valid'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.CHECKOUT_FAILED
      };
    }
  }

  /**
   * Process payment
   */
  async processPayment(
    paymentMethod: PaymentMethod, 
    amount: number, 
    orderId: string
  ): Promise<CheckoutServiceResponse<{ transactionId: string }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

      // Mock payment processing
      const transactionId = `TXN-${Date.now()}`;

      // Simulate payment success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (!success) {
        return {
          data: { transactionId: '' },
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.PAYMENT_FAILED
        };
      }

      return {
        data: { transactionId },
        success: true,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        data: { transactionId: '' },
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.PAYMENT_FAILED
      };
    }
  }

  /**
   * Place order
   */
  async placeOrder(checkoutData: CheckoutData, orderSummary: OrderSummary): Promise<CheckoutServiceResponse<{ orderId: string; transactionId: string }>> {
    try {
      // Validate checkout data first
      const validation = await this.validateCheckout(checkoutData);
      if (!validation.success) {
        return {
          data: { orderId: '', transactionId: '' },
          success: false,
          message: validation.message
        };
      }

      // Generate order ID
      const orderId = `ORD-${Date.now()}`;

      // Process payment
      const paymentResult = await this.processPayment(checkoutData.paymentMethod, orderSummary.total, orderId);
      if (!paymentResult.success) {
        return {
          data: { orderId: '', transactionId: '' },
          success: false,
          message: paymentResult.message
        };
      }

      return {
        data: { 
          orderId, 
          transactionId: paymentResult.data.transactionId 
        },
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.ORDER_PLACED
      };
    } catch (error) {
      return {
        data: { orderId: '', transactionId: '' },
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.CHECKOUT_FAILED
      };
    }
  }

  /**
   * Validate discount code
   */
  async validateDiscount(code: string): Promise<CheckoutServiceResponse<Discount>> {
    try {
      const response = await httpService.post(BACKEND_ROUTES.DISCOUNT_VALIDATE, { code });

      if (!response.ok) {
        let errorMessage = 'Invalid discount code';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          console.error('Error parsing discount validation API error response:', parseError);
        }
        
        return {
          data: {} as Discount,
          success: false,
          message: errorMessage
        };
      }

      const data = await response.json();
      return {
        data: {
          code: data.code,
          type: data.type,
          value: data.value
        },
        success: true,
        message: data.detail || 'Discount code applied successfully'
      };
    } catch (error) {
      console.error('Error validating discount code:', error);
      return {
        data: {} as Discount,
        success: false,
        message: 'Failed to validate discount code. Please check your connection and try again.'
      };
    }
  }

  /**
   * Set current user (for testing purposes)
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }
}

export const checkoutService = new CheckoutService();