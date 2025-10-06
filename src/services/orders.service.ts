import { httpService } from './http.service';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Order {
  id: string;
  user_id: number;
  total_amount: string;
  discount_amount: string;
  status: string;
  discount_code_id: number | null;
  shipping_address_id: number;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  payment_id: string | null;
  shipping_method: string;
  carrier_name: string;
  delivery_option: string;
  order_notes: string;
  delivery_cost: string;
  order_status: string;
  return_request: boolean;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateOrderRequest {
  shipping_address?: string;
  billing_address?: string;
  shipping_address_id: number;
  payment_method?: string;
  payment_id?: string;
  shipping_method?: string;
  carrier_name?: string;
  delivery_option: string;
  order_notes?: string;
  delivery_cost: number;
}

export interface OrderServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

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
}

class OrdersService {
  /**
   * Get all orders for the current user
   */
  async getUserOrders(skip: number = 0, limit: number = 50): Promise<OrderServiceResponse<Order[]>> {
    try {
      const url = `${BACKEND_ROUTES.ORDERS_ME}?skip=${skip}&limit=${limit}`;
      const response = await httpService.get(url);
      
      if (response.ok) {
        const orders: Order[] = await response.json();
        return {
          data: orders,
          success: true,
          message: 'Orders fetched successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: [],
          success: false,
          message: errorData.message || 'Failed to fetch orders'
        };
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        data: [],
        success: false,
        message: 'Network error while fetching orders'
      };
    }
  }

  /**
   * Update order status (for admin/backend simulation)
   */
  async updateOrderStatus(orderId: string, status: string): Promise<OrderServiceResponse<Order>> {
    try {
      const response = await httpService.patch(`${BACKEND_ROUTES.ORDERS || '/api/orders'}/${orderId}/status`, {
        order_status: status
      });

      if (response.ok) {
        const updatedOrder: Order = await response.json();
        return {
          data: updatedOrder,
          success: true,
          message: 'Order status updated successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Order,
          success: false,
          message: errorData.message || 'Failed to update order status'
        };
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        data: {} as Order,
        success: false,
        message: 'Network error while updating order status'
      };
    }
  }

  /**
   * Request return for an order
   */
  async requestReturn(orderId: string, reason: string): Promise<OrderServiceResponse<boolean>> {
    try {
      const response = await httpService.patch(`${BACKEND_ROUTES.ORDERS || '/api/orders'}/${orderId}/return`, {
        return_request: true,
        return_reason: reason
      });

      if (response.ok) {
        return {
          data: true,
          success: true,
          message: 'Return request submitted successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: false,
          success: false,
          message: errorData.message || 'Failed to submit return request'
        };
      }
    } catch (error) {
      console.error('Error requesting return:', error);
      return {
        data: false,
        success: false,
        message: 'Network error while submitting return request'
      };
    }
  }

  /**
   * Get order details by ID
   */
  async getOrderById(orderId: string): Promise<OrderServiceResponse<Order>> {
    try {
      const response = await httpService.get(`${BACKEND_ROUTES.ORDERS || '/api/orders'}/${orderId}`);
      
      if (response.ok) {
        const order: Order = await response.json();
        return {
          data: order,
          success: true,
          message: 'Order details fetched successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Order,
          success: false,
          message: errorData.message || 'Failed to fetch order details'
        };
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        data: {} as Order,
        success: false,
        message: 'Network error while fetching order details'
      };
    }
  }

  /**
   * Cancel an order (if allowed)
   */
  async cancelOrder(orderId: string): Promise<OrderServiceResponse<boolean>> {
    try {
      const response = await httpService.patch(`${BACKEND_ROUTES.ORDERS || '/api/orders'}/${orderId}/cancel`, {
        status: 'cancelled'
      });

      if (response.ok) {
        return {
          data: true,
          success: true,
          message: 'Order cancelled successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: false,
          success: false,
          message: errorData.message || 'Failed to cancel order'
        };
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        data: false,
        success: false,
        message: 'Network error while cancelling order'
      };
    }
  }

  /**
   * Format order status for display
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'returned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Format payment method for display
   */
  formatPaymentMethod(method: string): string {
    switch (method.toLowerCase()) {
      case 'cod':
        return 'Cash on Delivery';
      case 'online':
        return 'Online Payment';
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }

  /**
   * Format shipping method for display
   */
  formatShippingMethod(method: string): string {
    switch (method.toLowerCase()) {
      case 'standard':
        return 'Standard Delivery';
      case 'express':
        return 'Express Delivery';
      case 'overnight':
        return 'Overnight Delivery';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }
  /**
   * Create a Cash on Delivery order
   */
  async createCODOrder(orderData: CreateOrderRequest): Promise<OrderServiceResponse<Order>> {
    try {
      const response = await httpService.post(BACKEND_ROUTES.ORDERS_COD, orderData);

      if (response.ok) {
        const data = await response.json();
        return {
          data: data,
          success: true,
          message: 'Order created successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Order,
          success: false,
          message: errorData.message || 'Failed to create order'
        };
      }
    } catch (error) {
      console.error('Error creating COD order:', error);
      return {
        data: {} as Order,
        success: false,
        message: 'Failed to create order'
      };
    }
  }

  /**
   * Create an Online Payment order
   */
  async createOnlineOrder(orderData: CreateOrderRequest): Promise<OrderServiceResponse<Order>> {
    try {
      // Use the general orders endpoint for online payments
      const response = await httpService.post(BACKEND_ROUTES.ORDERS, {
        ...orderData,
        payment_method: 'online' // Explicitly set payment method for online orders
      });

      if (response.ok) {
        const data = await response.json();
        return {
          data: data,
          success: true,
          message: 'Order created successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Order,
          success: false,
          message: errorData.message || 'Failed to create order'
        };
      }
    } catch (error) {
      console.error('Error creating online order:', error);
      return {
        data: {} as Order,
        success: false,
        message: 'Failed to create order'
      };
    }
  }

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
        return {
          data: data,
          success: true,
          message: 'Payment verified successfully'
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
    orderData: CreateOrderRequest
  ): Promise<{
    order: OrderServiceResponse<Order>;
    payment: PaymentServiceResponse<PaymentCredentials> | null;
  }> {
    // First create the online order
    const orderResult = await this.createOnlineOrder(orderData);
    
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

  /**
   * Get delivery cost based on shipping method
   */
  getDeliveryCost(shippingMethod: 'standard' | 'express'): number {
    switch (shippingMethod) {
      case 'standard':
        return 75;
      case 'express':
        return 100;
      default:
        return 75;
    }
  }

  /**
   * Create a general order (works for both COD and online payments)
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderServiceResponse<Order>> {
    try {
      const response = await httpService.post(BACKEND_ROUTES.ORDERS, orderData);

      if (response.ok) {
        const data = await response.json();
        return {
          data: data,
          success: true,
          message: 'Order created successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as Order,
          success: false,
          message: errorData.message || 'Failed to create order'
        };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        data: {} as Order,
        success: false,
        message: 'Failed to create order'
      };
    }
  }

  /**
   * Prepare order data from checkout form
   */
  prepareOrderData(
    selectedAddress: any,
    selectedShipping: 'standard' | 'express',
    paymentMethod: 'COD' | 'online' = 'COD',
    orderNotes?: string
  ): CreateOrderRequest {
    const deliveryCost = this.getDeliveryCost(selectedShipping);
    
    return {
      shipping_address_id: selectedAddress.id ? Number(selectedAddress.id) : 0,
      shipping_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
      billing_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
      payment_method: paymentMethod,
      shipping_method: selectedShipping,
      delivery_option: selectedShipping,
      carrier_name: selectedShipping === 'express' ? 'Express Courier' : 'Standard Post',
      order_notes: orderNotes || '',
      delivery_cost: deliveryCost
    };
  }
}

export const ordersService = new OrdersService();