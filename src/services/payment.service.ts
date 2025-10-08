import { httpService } from './http.service';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';

export interface PaymentCredentials {
  razorpay_order_id: string;
  amount: number;
  key_id: string;
}

export interface CreatePaymentRequest {
  order_id: string;
}

export interface PaymentServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  message?: string;
  payment_id?: string;
  order_id?: string;
  status?: string;
}

class PaymentService {
  /**
   * Create payment credentials for Razorpay after creating an online order
   */
  async createPayment(orderId: string): Promise<PaymentServiceResponse<PaymentCredentials>> {
    try {
      const response = await httpService.post(BACKEND_ROUTES.PAYMENTS_CREATE, {
        order_id: orderId
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store payment credentials in localStorage for later use
        const paymentData = {
          razorpay_order_id: data.razorpay_order_id,
          amount: data.amount,
          key_id: data.key_id,
          order_id: orderId,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vauria_payment_credentials', JSON.stringify(paymentData));
        
        return {
          data: data,
          success: true,
          message: 'Payment credentials created successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as PaymentCredentials,
          success: false,
          message: errorData.message || 'Failed to create payment credentials'
        };
      }
    } catch (error) {
      console.error('Error creating payment credentials:', error);
      return {
        data: {} as PaymentCredentials,
        success: false,
        message: 'Failed to create payment credentials'
      };
    }
  }

  /**
   * Get payment credentials from localStorage
   */
  getStoredPaymentCredentials(): PaymentCredentials | null {
    try {
      const stored = localStorage.getItem('vauria_payment_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          razorpay_order_id: parsed.razorpay_order_id,
          amount: parsed.amount,
          key_id: parsed.key_id
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting stored payment credentials:', error);
      return null;
    }
  }

  /**
   * Clear payment credentials from localStorage
   */
  clearStoredPaymentCredentials(): void {
    try {
      localStorage.removeItem('vauria_payment_credentials');
    } catch (error) {
      console.error('Error clearing payment credentials:', error);
    }
  }

  /**
   * Get payment result from localStorage
   */
  getStoredPaymentResult(): any {
    try {
      const stored = localStorage.getItem('vauria_payment_result');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored payment result:', error);
      return null;
    }
  }

  /**
   * Store payment result in localStorage
   */
  storePaymentResult(paymentResponse: any): void {
    try {
      const paymentResult = {
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('vauria_payment_result', JSON.stringify(paymentResult));
    } catch (error) {
      console.error('Error storing payment result:', error);
    }
  }

  /**
   * Clear payment result from localStorage
   */
  clearStoredPaymentResult(): void {
    try {
      localStorage.removeItem('vauria_payment_result');
    } catch (error) {
      console.error('Error clearing payment result:', error);
    }
  }

  /**
   * Verify payment with server
   */
  async verifyPayment(verificationData: PaymentVerificationRequest): Promise<PaymentServiceResponse<PaymentVerificationResponse>> {
    try {
      const response = await httpService.post(BACKEND_ROUTES.PAYMENTS_VERIFY, verificationData);

      if (response.ok) {
        const data = await response.json();
        
        // The API returns {"status":"success","order_id":"..."}
        // We need to transform this to match our interface
        const isVerified = data.status === 'success';
        
        return {
          data: {
            verified: isVerified,
            message: isVerified ? 'Payment verified successfully' : 'Payment verification failed',
            order_id: data.order_id,
            status: data.status
          },
          success: true,
          message: 'Payment verification completed'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: { verified: false, message: 'Verification failed' },
          success: false,
          message: errorData.message || 'Failed to verify payment'
        };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        data: { verified: false, message: 'Network error' },
        success: false,
        message: 'Failed to verify payment'
      };
    }
  }

  /**
   * Create online order and generate payment credentials in one flow
   */
  async createOnlineOrderWithPayment(
    orderData: any,
    ordersService: any
  ): Promise<{
    order: any;
    payment: PaymentServiceResponse<PaymentCredentials> | null;
  }> {
    // First create the online order
    const orderResult = await ordersService.createOnlineOrder(orderData);
    
    if (orderResult.success && orderResult.data.id) {
      // If order creation was successful, create payment credentials
      const paymentResult = await this.createPayment(orderResult.data.id);
      
      return {
        order: orderResult,
        payment: paymentResult
      };
    } else {
      return {
        order: orderResult,
        payment: null
      };
    }
  }
}

export const paymentService = new PaymentService();