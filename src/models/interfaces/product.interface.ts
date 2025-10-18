// Product Interfaces and Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number; // condecimal(max_digits=10, decimal_places=2)
  offer_price: number | null; // Optional[condecimal(max_digits=10, decimal_places=2)]
  stock: number;
  material: string | null;
  weight: number | null; // Optional[condecimal(max_digits=8, decimal_places=3)]
  dimensions: string | null;
  is_active: boolean;
  featured: boolean;
  category_id: number | null;
  image_url: string | null;
  created_at: string; // datetime as ISO string
  images?: string[]; // Additional images for UI
  specifications?: {
    [key: string]: string;
  };
  care_instructions?: string[];
  tags?: string[];
}



// Product filter and sorting
export type SortOption = 
  | 'featured' 
  | 'price-low-high' 
  | 'price-high-low' 
  | 'newest' 
  | 'popularity' 
  | 'rating';

export interface FilterOptions {
  priceRange?: { min: number; max: number; label?: string };
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  minRating?: number;
  priceRanges?: Array<{ min: number; max: number; label: string }>;
  ratings?: number[];
}

export interface CategoryProducts {
  [categorySlug: string]: Product[];
}

// User and Order Management Interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  preferences?: {
    notifications?: boolean;
    marketing?: boolean;
    theme?: 'light' | 'dark';
  };
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isDefault?: boolean;
  type?: 'home' | 'office' | 'other';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'cod';
  provider?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardHolderName?: string;
  upiId?: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface CheckoutData {
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  deliveryInstructions?: string;
  giftMessage?: string;
  isGift?: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  salesGrowth: number;
  productGrowth: number;
  customerGrowth: number;
  orderGrowth: number;
}

// Banner interface
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  showOverlay?: boolean; // New property to control overlay display
}

// Image Generation Types
export interface GenerationTemplate {
  id: string;
  categorySlug: string;
  categoryName: string;
  basePrompt: string;
  placeholders: string[];
  suggestedPoses?: string[];
}

export interface ImageGenerationRequest {
  customerImageUrl: string;
  productImageUrl: string;
  productId: string;
  categoryTemplate: GenerationTemplate;
  customPrompt?: string;
}

export interface ImageGenerationResponse {
  id: string;
  generatedImageUrl: string;
  originalCustomerImage: string;
  originalProductImage: string;
  prompt: string;
  categoryTemplate: GenerationTemplate;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  processingTime?: number;
}

// Generic API Response Type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}