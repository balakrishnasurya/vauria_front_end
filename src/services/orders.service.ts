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
  discount_code?: string;
  delivery_cost: number;
}

export interface OrderServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface RevertOrderResponse {
  status: string;
  message: string;
  order_id: string;
  restored_items: {
    product_id: number;
    product_name: string;
    quantity: number;
  }[];
  cart_updated: boolean;
  stock_restored: boolean;
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
   * Revert user order - cancels order and restores stock/cart
   */
  async revertUserOrder(orderId: string): Promise<OrderServiceResponse<RevertOrderResponse>> {
    try {
      const payload = {
        order_id: orderId,
        reason: "cancelled_order since user closed payment and reverted stock and cart using user-revert"
      };

      const response = await httpService.post(BACKEND_ROUTES.PAYMENTS_USER_REVERT, payload);

      if (response.ok) {
        const data: RevertOrderResponse = await response.json();
        return {
          data,
          success: true,
          message: data.message || 'Order reverted successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: {} as RevertOrderResponse,
          success: false,
          message: errorData.message || 'Failed to revert order'
        };
      }
    } catch (error) {
      console.error('Error reverting order:', error);
      return {
        data: {} as RevertOrderResponse,
        success: false,
        message: 'Network error while reverting order'
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
   * Format order status for display (deprecated - handle in UI components)
   */
  getStatusColor(status: string): string {
    // Method body removed - handle styling in UI components
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Format payment method for display (deprecated - handle in UI components)
   */
  formatPaymentMethod(method: string): string {
    // Method body removed - handle formatting in UI components
    return method;
  }

  /**
   * Format shipping method for display (deprecated - handle in UI components)
   */
  formatShippingMethod(method: string): string {
    // Method body removed - handle formatting in UI components
    return method;
  }
  /**
   * Create a Cash on Delivery order
   */
  async createCODOrder(orderData: CreateOrderRequest): Promise<OrderServiceResponse<Order>> {
    try {
      // Prepare payload with all order data including discount_code if available
      const payload = {
        ...orderData,
        ...(orderData.discount_code && { discount_code: orderData.discount_code })
      };

      const response = await httpService.post(BACKEND_ROUTES.ORDERS_COD, payload);

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
      // Prepare payload with all order data including discount_code if available
      const payload = {
        ...orderData,
        payment_method: 'online', // Explicitly set payment method for online orders
        ...(orderData.discount_code && { discount_code: orderData.discount_code })
      };

      const response = await httpService.post(BACKEND_ROUTES.ORDERS, payload);

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
   * Get delivery cost based on shipping method (deprecated - use shipping API)
   */
  getDeliveryCost(shippingMethod: 'standard' | 'express'): number {
    // Method body removed - use real-time shipping rates API instead
    return 0;
  }

  /**
   * Create a general order (works for both COD and online payments)
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderServiceResponse<Order>> {
    try {
      // Prepare payload with all order data including discount_code if available
      const payload = {
        ...orderData,
        ...(orderData.discount_code && { discount_code: orderData.discount_code })
      };

      const response = await httpService.post(BACKEND_ROUTES.ORDERS, payload);

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
}

export const ordersService = new OrdersService();