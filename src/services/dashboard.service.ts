import { httpService } from '@/services/http.service';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';

export interface OrderItemDTO {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderDTO {
  id: string;
  user_id: number;
  total_amount: string;
  discount_amount: string;
  status: 'paid' | 'pending' | 'cancelled' | 'returned';
  discount_code_id: number | null;
  shipping_address_id: number;
  shipping_address: string;
  billing_address: string;
  payment_method: 'online' | 'COD';
  payment_id: string | null;
  shipping_method: string;
  carrier_name: string;
  delivery_option: string;
  order_notes: string;
  delivery_cost: string;
  order_status: string;
  return_request: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  items: OrderItemDTO[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

class DashboardService {
  async getAllOrders(skip = 0, limit = 50): Promise<OrderDTO[]> {
    const url = `${BACKEND_ROUTES.ORDERS}?skip=${skip}&limit=${limit}`;
    const res = await httpService.get(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
    }
    const data = await res.json();
    // Expecting an array per the provided response
    return data as OrderDTO[];
  }
}

export const dashboardService = new DashboardService();