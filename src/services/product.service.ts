import { mockProducts } from '@/data/products.data';
import { Product } from '@/models/interfaces/product.interface';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';
import { httpService } from '@/services/http.service';

export interface ProductService {
  // API-backed with pagination
  getProductsFromApi(params?: ProductQueryParams): Promise<PaginatedProductResponse>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductBySlugFromApi(slug: string): Promise<Product | null>;
  getProductById(id: number | string): Promise<Product | null>;
  getProductByIdFromApi(id: number | string): Promise<Product | null>;
  searchProductsFromApi(query: string, params?: ProductQueryParams): Promise<PaginatedProductResponse>;
  // Placeholder methods (not implemented)
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getSimilarProducts(productId: string, categoryId: string): Promise<Product[]>;
  getRecentlyViewedProducts(): Promise<Product[]>;
  addToRecentlyViewed(productId: number | string): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
}

export interface ProductQueryParams {
  page?: number;
  per_page?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  search?: string;
}

export interface PaginatedProductResponse {
  items: Product[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

class ProductServiceImpl implements ProductService {

  private mapApiProduct(p: any): Product {
    return this.productResponseTransform(p);
  }

  private productResponseTransform(p: any): Product {
    const FALLBACK_IMAGE = 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/CHAINS.JPG';
    const toNumber = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const rawImage = (p.image_url ?? '').toString();
    const hasValidImage = rawImage && rawImage.toLowerCase() !== 'string';
    const imageUrl = hasValidImage ? rawImage : FALLBACK_IMAGE;

    return {
      id: Number(p.id),
      name: p.name ?? '',
      slug: p.slug ?? String(p.id), 
      description: p.description ?? null,
      price: Number(p.price ?? 0),
      offer_price: p.offer_price != null ? Number(p.offer_price) : null,
      stock: Number(p.stock ?? 0),
      material: p.material ?? null,
      weight: toNumber(p.weight),
      dimensions: p.dimensions ?? null,
      is_active: Boolean(p.is_active),
      featured: Boolean(p.featured),
      category_id: p.category_id != null ? Number(p.category_id) : null,
      image_url: imageUrl,
      created_at: p.created_at ?? new Date().toISOString(),
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [imageUrl],
      specifications: p.specifications ?? undefined,
      care_instructions: p.care_instructions ?? undefined,
      tags: p.tags ?? undefined
    } as Product;
  }

  private buildQuery(params?: ProductQueryParams): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.per_page != null) searchParams.set('per_page', String(params.per_page));
    if (params.category_id != null) searchParams.set('category_id', String(params.category_id));
    if (params.min_price != null) searchParams.set('min_price', String(params.min_price));
    if (params.max_price != null) searchParams.set('max_price', String(params.max_price));
    if (params.featured != null) searchParams.set('featured', String(params.featured));
    if (params.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
  }

  async getProductsFromApi(params?: ProductQueryParams): Promise<PaginatedProductResponse> {
    try {
      const base = BACKEND_ROUTES.PRODUCTS;
      if (!base) throw new Error('PRODUCTS route not configured');
      const url = `${base}${this.buildQuery(params)}`;
      const res = await httpService.get(url);
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
      const data = await res.json();
      
      // Check if response has pagination metadata (new format)
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return {
          items: data.items.map((p: any) => this.mapApiProduct(p)),
          page: data.page || 1,
          per_page: data.per_page || 20,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: data.has_next || false,
          has_prev: data.has_prev || false
        };
      }
      
      // Fallback for old format (array only) - should be removed once API is fully updated
      if (Array.isArray(data)) {
        const products = data.map((p: any) => this.mapApiProduct(p));
        return {
          items: products,
          page: params?.page || 1,
          per_page: params?.per_page || 20,
          total: products.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        };
      }
      
      throw new Error('Unexpected products response format');
    } catch (e) {
      console.error('Error fetching products from API:', e);
      // Fallback to mock products to keep UI functional
      const products = mockProducts.slice(0, params?.per_page ?? 20);
      return {
        items: products,
        page: params?.page || 1,
        per_page: params?.per_page || 20,
        total: products.length,
        total_pages: 1,
        has_next: false,
        has_prev: false
      };
    }
  }

  async searchProductsFromApi(query: string, params?: ProductQueryParams): Promise<PaginatedProductResponse> {
    try {
      const searchParams = { ...params, search: query };
      return await this.getProductsFromApi(searchParams);
    } catch (e) {
      console.error('Error searching products from API:', e);
      // Fallback to local search
      const products = await this.searchProducts(query);
      const page = params?.page || 1;
      const per_page = params?.per_page || 20;
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + per_page;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return {
        items: paginatedProducts,
        page: page,
        per_page: per_page,
        total: products.length,
        total_pages: Math.ceil(products.length / per_page),
        has_next: endIndex < products.length,
        has_prev: page > 1
      };
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    // Try to get product from API first
    try {
      return await this.getProductBySlugFromApi(slug);
    } catch (error) {
      console.error("API call failed, falling back to mock data", error);
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find in products.data.ts
      const product = mockProducts.find(p => p.slug === slug && p.is_active);
      
      if (product) {
        // Add to recently viewed
        await this.addToRecentlyViewed(product.id);
      }
      return product || null;
    }
  }
  
  async getProductBySlugFromApi(slug: string): Promise<Product | null> {
    try {
      const base = BACKEND_ROUTES.PRODUCTFROMSLUG(slug);
      if (!base) throw new Error('PRODUCTS SULG route not configured');
      const url = `${base}`;
      
      const res = await httpService.get(url);
      if (!res.ok) throw new Error(`Failed to fetch product (${res.status})`);
      
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error('Unexpected product response format');
      
      const product = this.productResponseTransform(data);
      
      // Add to recently viewed
      if (product) {
        await this.addToRecentlyViewed(product.id);
      }
      
      return product;
    } catch (e) {
      console.error(`Error fetching product by slug: ${slug}`, e);
      throw e; // Re-throw to allow fallback in getProductBySlug
    }
  }

  async getProductById(id: number | string): Promise<Product | null> {
    // Try to get product from API first
    try {
      return await this.getProductByIdFromApi(id);
    } catch (error) {
      console.error("API call failed, falling back to mock data", error);
      
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 300));
      const productId = Number(id);
      const product = mockProducts.find(p => p.id === productId && p.is_active);
      return product || null;
    }
  }
  
  async getProductByIdFromApi(id: number | string): Promise<Product | null> {
    try {
      const base = BACKEND_ROUTES.PRODUCT_BY_ID(id);
      if (!base) throw new Error('PRODUCT_BY_ID route not configured');
      const url = `${base}`;
      
      const res = await httpService.get(url);
      if (!res.ok) throw new Error(`Failed to fetch product (${res.status})`);
      
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error('Unexpected product response format');
      
      const product = this.productResponseTransform(data);
      return product;
    } catch (e) {
      console.error(`Error fetching product by ID: ${id}`, e);
      throw e; // Re-throw to allow fallback in getProductById
    }
  }

  async getProducts(): Promise<Product[]> {
    // TODO: Implement API call if needed
    return [];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    // TODO: Implement API call if needed
    return [];
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    // TODO: Implement API call if needed
    return [];
  }

  async getSimilarProducts(productId: string, categoryId: string): Promise<Product[]> {
    // TODO: Implement API call if needed
    return [];
  }

  async getRecentlyViewedProducts(): Promise<Product[]> {
    // TODO: Implement if needed
    return [];
  }

  async addToRecentlyViewed(productId: number | string): Promise<void> {
    // TODO: Implement if needed
  }

  async searchProducts(query: string): Promise<Product[]> {
    // TODO: Use searchProductsFromApi instead
    return [];
  }
}

export const productService = new ProductServiceImpl();