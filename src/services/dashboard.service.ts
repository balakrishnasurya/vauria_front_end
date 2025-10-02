import { 
  mockOrders, 
  mockProducts, 
  mockUsers, 
  mockDashboardStats,
  Order, 
  ProductMockData as Product, 
  User, 
  DashboardStats 
} from '@/data/products.data';

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  image: string;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'product' | 'customer' | 'inventory';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export class DashboardService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(400);
    return mockDashboardStats;
  }

  // Get recent orders
  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    await this.delay(300);
    return mockOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Get top performing products
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    await this.delay(350);
    
    // Calculate sales data for each product (mock calculation)
    const productSales = mockProducts.map(product => {
      const orders = mockOrders.filter(order => 
        order.items.some(item => item.productId === product.id)
      );
      
      const sales = orders.reduce((total, order) => {
        const item = order.items.find(item => item.productId === product.id);
        return total + (item ? item.quantity : 0);
      }, 0);

      const revenue = orders.reduce((total, order) => {
        const item = order.items.find(item => item.productId === product.id);
        return total + (item ? item.price * item.quantity : 0);
      }, 0);

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        sales,
        revenue,
        image: product.image
      };
    });

    return productSales
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    await this.delay(250);

    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'order',
        message: 'New order from Isabella Martinez',
        timestamp: '2024-01-15T10:30:00Z',
        status: 'success'
      },
      {
        id: '2',
        type: 'product',
        message: 'Diamond collection updated',
        timestamp: '2024-01-15T09:15:00Z',
        status: 'info'
      },
      {
        id: '3',
        type: 'inventory',
        message: 'Low stock alert: Pearl necklaces',
        timestamp: '2024-01-15T08:45:00Z',
        status: 'warning'
      },
      {
        id: '4',
        type: 'customer',
        message: 'New customer registration: Sophia Chen',
        timestamp: '2024-01-14T16:20:00Z',
        status: 'success'
      },
      {
        id: '5',
        type: 'order',
        message: 'Order ORD-002 shipped',
        timestamp: '2024-01-14T14:30:00Z',
        status: 'info'
      },
      {
        id: '6',
        type: 'product',
        message: 'New product added: Royal Tiara',
        timestamp: '2024-01-14T11:00:00Z',
        status: 'success'
      },
      {
        id: '7',
        type: 'inventory',
        message: 'Stock replenished: Gold chains',
        timestamp: '2024-01-13T15:30:00Z',
        status: 'success'
      },
      {
        id: '8',
        type: 'order',
        message: 'Large order completed: ₹3,89,000',
        timestamp: '2024-01-13T12:15:00Z',
        status: 'success'
      }
    ];

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get sales data for charts (mock data)
  async getSalesData(period: 'week' | 'month' | 'year' = 'month'): Promise<SalesData[]> {
    await this.delay(400);

    const generateMockData = (days: number): SalesData[] => {
      const data: SalesData[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate mock sales data
        const baseSales = 50000 + Math.random() * 100000;
        const baseOrders = 5 + Math.floor(Math.random() * 15);

        data.push({
          date: date.toISOString().split('T')[0],
          sales: Math.floor(baseSales),
          orders: baseOrders
        });
      }

      return data;
    };

    switch (period) {
      case 'week':
        return generateMockData(7);
      case 'month':
        return generateMockData(30);
      case 'year':
        return generateMockData(365);
      default:
        return generateMockData(30);
    }
  }

  // Get all orders with pagination
  async getAllOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; total: number; totalPages: number }> {
    await this.delay(400);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const sortedOrders = mockOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      orders: sortedOrders.slice(startIndex, endIndex),
      total: mockOrders.length,
      totalPages: Math.ceil(mockOrders.length / limit)
    };
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    await this.delay(200);
    return mockOrders.find(order => order.id === orderId) || null;
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; message: string }> {
    await this.delay(300);

    const orderIndex = mockOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    mockOrders[orderIndex].status = status;

    return {
      success: true,
      message: 'Order status updated successfully'
    };
  }

  // Get all customers with pagination
  async getAllCustomers(page: number = 1, limit: number = 20): Promise<{ customers: User[]; total: number; totalPages: number }> {
    await this.delay(400);

    const customers = mockUsers.filter(user => user.role === 'customer');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      customers: customers.slice(startIndex, endIndex),
      total: customers.length,
      totalPages: Math.ceil(customers.length / limit)
    };
  }

  // Get all products with pagination
  async getAllProducts(page: number = 1, limit: number = 20): Promise<{ products: Product[]; total: number; totalPages: number }> {
    await this.delay(400);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      products: mockProducts.slice(startIndex, endIndex),
      total: mockProducts.length,
      totalPages: Math.ceil(mockProducts.length / limit)
    };
  }

  // Add new product
  async addProduct(productData: Omit<Product, 'id'>): Promise<{ success: boolean; product?: Product; message: string }> {
    await this.delay(600);

    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`
    };

    mockProducts.push(newProduct);

    return {
      success: true,
      product: newProduct,
      message: 'Product added successfully'
    };
  }

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<{ success: boolean; product?: Product; message: string }> {
    await this.delay(500);

    const productIndex = mockProducts.findIndex(product => product.id === productId);
    
    if (productIndex === -1) {
      return {
        success: false,
        message: 'Product not found'
      };
    }

    mockProducts[productIndex] = { ...mockProducts[productIndex], ...updates };

    return {
      success: true,
      product: mockProducts[productIndex],
      message: 'Product updated successfully'
    };
  }

  // Delete product
  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(400);

    const productIndex = mockProducts.findIndex(product => product.id === productId);
    
    if (productIndex === -1) {
      return {
        success: false,
        message: 'Product not found'
      };
    }

    mockProducts.splice(productIndex, 1);

    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }
}

export const dashboardService = new DashboardService();