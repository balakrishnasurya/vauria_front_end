import { 
  mockBanners, 
  mockProducts
} from '@/data/products.data';
import { mockCategories } from '@/data/categories.data';
import { Product, Banner } from '@/models/interfaces/product.interface';
import { Category } from '@/models/interfaces/categories.interface';

export class HomeService {
  // Simulate API delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all active banners
  async getBanners(): Promise<Banner[]> {
    await this.delay(300);
    return mockBanners.filter(banner => banner.isActive);
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    await this.delay(200);
    return mockCategories;
  }

  // Get popular products
  async getPopularProducts(limit: number = 8): Promise<Product[]> {
    await this.delay(400);
    return mockProducts
      .filter(product => product.featured)
      .slice(0, limit);
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    await this.delay(400);
    return mockProducts
      .filter(product => product.featured)
      .slice(0, limit);
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    await this.delay(500);
    const lowercaseQuery = query.toLowerCase();
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      (product.description && product.description.toLowerCase().includes(lowercaseQuery)) ||
      (product.material && product.material.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get products by category
  async getProductsByCategory(categorySlug: string, limit?: number): Promise<Product[]> {
    await this.delay(400);
    // For now, return featured products since we don't have exact category matching set up
    // In a real app, you'd match against category_id or category slugs
    const filteredProducts = mockProducts.filter(product => product.is_active);
    
    return limit ? filteredProducts.slice(0, limit) : filteredProducts;
  }

  // Get single product by ID
  async getProductById(productId: string): Promise<Product | null> {
    await this.delay(300);
    return mockProducts.find(product => product.id.toString() === productId) || null;
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await this.delay(200);
    return mockCategories.find(category => category.slug === slug) || null;
  }

  // Get recommended products (based on category or random)
  async getRecommendedProducts(excludeProductId?: string, limit: number = 4): Promise<Product[]> {
    await this.delay(350);
    let products = mockProducts.filter(product => 
      product.id.toString() !== excludeProductId && product.stock > 0 && product.is_active
    );
    
    // Shuffle and return limited results
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // Validate pincode (mock validation)
  async validatePincode(pincode: string): Promise<{ valid: boolean; city?: string; state?: string }> {
    await this.delay(300);
    
    // Mock pincode validation logic
    const validPincodes: Record<string, { city: string; state: string }> = {
      '400001': { city: 'Mumbai', state: 'Maharashtra' },
      '110001': { city: 'Delhi', state: 'Delhi' },
      '560001': { city: 'Bangalore', state: 'Karnataka' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu' },
      '700001': { city: 'Kolkata', state: 'West Bengal' },
      '411001': { city: 'Pune', state: 'Maharashtra' },
      '500001': { city: 'Hyderabad', state: 'Telangana' },
      '302001': { city: 'Jaipur', state: 'Rajasthan' }
    };

    const location = validPincodes[pincode];
    return {
      valid: !!location,
      ...location
    };
  }
}

export const homeService = new HomeService();