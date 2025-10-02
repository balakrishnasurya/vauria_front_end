import { mockUsers } from '@/data/products.data';
import { type Address, type PaymentMethod, type CheckoutData, type User } from '@/models/interfaces/product.interface';
import { MESSAGES } from '@/constants/messages.constants';

export interface CheckoutServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ShippingCalculation {
  standard: { cost: number; days: string; };
  express: { cost: number; days: string; };
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
   * Get user addresses
   */
  async getUserAddresses(): Promise<CheckoutServiceResponse<Address[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const user = mockUsers.find(u => u.id === this.currentUserId);
      if (!user || !user.addresses) {
        return {
          data: [],
          success: true,
          message: 'No addresses found'
        };
      }

      return {
        data: user.addresses,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.ADDRESS_SAVED
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.ADDRESS_SAVE_FAILED
      };
    }
  }

  /**
   * Add new address
   */
  async addAddress(address: Omit<Address, 'id'>): Promise<CheckoutServiceResponse<Address>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: false
      };

      const userIndex = mockUsers.findIndex(u => u.id === this.currentUserId);
      if (userIndex !== -1) {
        if (!mockUsers[userIndex].addresses) {
          mockUsers[userIndex].addresses = [];
        }
        mockUsers[userIndex].addresses!.push(newAddress);
      }

      return {
        data: newAddress,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.ADDRESS_SAVED
      };
    } catch (error) {
      return {
        data: {} as Address,
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.ADDRESS_SAVE_FAILED
      };
    }
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<CheckoutServiceResponse<Address>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const userIndex = mockUsers.findIndex(u => u.id === this.currentUserId);
      if (userIndex === -1 || !mockUsers[userIndex].addresses) {
        return {
          data: {} as Address,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.ADDRESS_NOT_FOUND
        };
      }

      const addressIndex = mockUsers[userIndex].addresses!.findIndex((a: any) => a.id === addressId);
      if (addressIndex === -1) {
        return {
          data: {} as Address,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.ADDRESS_NOT_FOUND
        };
      }

      const updatedAddress = { ...mockUsers[userIndex].addresses![addressIndex], ...updates };
      mockUsers[userIndex].addresses![addressIndex] = updatedAddress;

      return {
        data: updatedAddress,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.ADDRESS_UPDATED
      };
    } catch (error) {
      return {
        data: {} as Address,
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.ADDRESS_UPDATE_FAILED
      };
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<CheckoutServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const userIndex = mockUsers.findIndex(u => u.id === this.currentUserId);
      if (userIndex === -1 || !mockUsers[userIndex].addresses) {
        return {
          data: false,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.ADDRESS_NOT_FOUND
        };
      }

      const initialLength = mockUsers[userIndex].addresses!.length;
      mockUsers[userIndex].addresses = mockUsers[userIndex].addresses!.filter((a: any) => a.id !== addressId);

      if (mockUsers[userIndex].addresses!.length === initialLength) {
        return {
          data: false,
          success: false,
          message: MESSAGES.CHECKOUT.ERROR.ADDRESS_NOT_FOUND
        };
      }

      return {
        data: true,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.ADDRESS_DELETED
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.ADDRESS_DELETE_FAILED
      };
    }
  }

  /**
   * Get user payment methods
   */
  async getUserPaymentMethods(): Promise<CheckoutServiceResponse<PaymentMethod[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const user = mockUsers.find(u => u.id === this.currentUserId);
      if (!user || !user.paymentMethods) {
        return {
          data: [],
          success: true,
          message: 'No payment methods found'
        };
      }

      return {
        data: user.paymentMethods,
        success: true,
        message: 'Payment methods fetched successfully'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.PAYMENT_METHOD_SAVE_FAILED
      };
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<CheckoutServiceResponse<PaymentMethod>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm-${Date.now()}`,
        isDefault: false
      };

      const userIndex = mockUsers.findIndex(u => u.id === this.currentUserId);
      if (userIndex !== -1) {
        if (!mockUsers[userIndex].paymentMethods) {
          mockUsers[userIndex].paymentMethods = [];
        }
        mockUsers[userIndex].paymentMethods!.push(newPaymentMethod);
      }

      return {
        data: newPaymentMethod,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.PAYMENT_METHOD_SAVED
      };
    } catch (error) {
      return {
        data: {} as PaymentMethod,
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.PAYMENT_METHOD_SAVE_FAILED
      };
    }
  }

  /**
   * Calculate shipping options
   */
  async calculateShipping(address: Address): Promise<CheckoutServiceResponse<ShippingCalculation>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock shipping calculation based on pincode
      const pincode = address.pincode;
      let baseCost = 100;

      // Premium areas (lower pincodes) get cheaper shipping
      if (pincode.startsWith('1') || pincode.startsWith('4')) { // Delhi, Mumbai
        baseCost = 50;
      } else if (pincode.startsWith('5') || pincode.startsWith('6')) { // Bangalore, Chennai
        baseCost = 75;
      }

      const shipping: ShippingCalculation = {
        standard: { cost: baseCost, days: '5-7 days' },
        express: { cost: baseCost * 2, days: '4-5 days' }
        //premium: { cost: baseCost * 3, days: '1-2 days' }
      };

      return {
        data: shipping,
        success: true,
        message: MESSAGES.CHECKOUT.SUCCESS.SHIPPING_CALCULATED
      };
    } catch (error) {
      return {
        data: {
          standard: { cost: 100, days: '5-7 days' },
          express: { cost: 200, days: '4-5 days' }
          //premium: { cost: 300, days: '1-2 days' }
        },
        success: false,
        message: MESSAGES.CHECKOUT.ERROR.SHIPPING_CALCULATION_FAILED
      };
    }
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
      // Call the discount validation API endpoint
      const response = await fetch('https://lionfish-app-s5xgx.ondigitalocean.app/api/v1/discounts/validate', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        // Handle API error responses
        let errorMessage = 'Invalid discount code';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          // If we can't parse the error response, use default message
          console.error('Error parsing API error response:', parseError);
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