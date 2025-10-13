// Import interfaces from the new interfaces folder
import { Product, Banner, SortOption, FilterOptions, CategoryProducts, User, Order, OrderItem, Address, PaymentMethod, CheckoutData, DashboardStats, GenerationTemplate, ImageGenerationRequest, ImageGenerationResponse, ApiResponse } from '../models/interfaces/product.interface';

// Interfaces are now imported from the interfaces folder

export const mockProducts: Product[] = [

];

export const mockRecentlyViewed: Product[] = [
  mockProducts[1],
  mockProducts[3],
  mockProducts[5]
];

export const getSimilarProducts = (productId: string, categoryId: string): Product[] => {
  const numericProductId = parseInt(productId);
  const numericCategoryId = parseInt(categoryId);
  return mockProducts
    .filter(p => p.category_id === numericCategoryId && p.id !== numericProductId)
    .slice(0, 4);
};



// Banners Data
export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Jewels as Unique as You Are',
    subtitle: 'Discover timeless elegance',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/1.JPG?w=1200&h=600&fit=crop',
    ctaText: 'Shop Now',
    ctaLink: '/traditional-chains',
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'Celebrate Every Chapter with a Touch of Gold',
    subtitle: 'Elegance Redefined',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/2.JPG?w=1200&h=600&fit=crop',
    ctaText: 'Explore Collection',
    ctaLink: '/necklaces',
    isActive: true
  },
  {
    id: 'banner-3',
    title: 'Elegance Is Not Optional. It is Essential',
    subtitle: 'Passion in Every Gem',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/3.JPG?w=1200&h=600&fit=crop',
    ctaText: 'View Collection',
    ctaLink: '/bangles',
    isActive: true
  }
];



// Additional exports for the application
export const mockFilterOptions: FilterOptions = {
  materials: ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'],
  colors: ['Gold', 'Silver', 'Rose Gold', 'White Gold', 'Black'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  priceRanges: [
    { min: 0, max: 50000, label: 'Under ₹50,000' },
    { min: 50000, max: 100000, label: '₹50,000 - ₹1,00,000' },
    { min: 100000, max: 200000, label: '₹1,00,000 - ₹2,00,000' },
    { min: 200000, max: 999999999, label: 'Above ₹2,00,000' }
  ]
};

// Sort options
export const sortOptions: SortOption[] = [
  'featured',
  'price-low-high',
  'price-high-low',
  'newest',
  'popularity',
  'rating'
];

export const mockSortOptions: SortOption[] = [
  'featured',
  'price-low-high',
  'price-high-low',
  'newest',
  'popularity',
  'rating'
];

// Mock Users for Dashboard
export const mockUsers: User[] = [
 
];

// Mock Orders for Dashboard
export const mockOrders: Order[] = [
  
];

// Category Products Mapping - Updated to match new categories structure
export const categoryMockData = {
  categoryProducts: {
    'necklaces':[
      // Necklace products
    ],
    'traditional-chains': [
      // Traditional chain products
     
    ],
    'casual-chains': [
      // Casual chain products
     
    ],
    'mangalsutra': [
      // Mangalsutra products
    ],
    'earrings': [
      // Earring products
    ],
    'bangles': [
      // Bangle products
    ],
    'bracelets': [
      // Bracelet products
    ],
    'rings-anklets-nosepins': [
      // Combined products
      
    ],
    'ift-hamper': [
      // Gift hamper products
    ]
  } as CategoryProducts
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalSales: 1088000,
  totalProducts: 147,
  totalCustomers: 2847,
  totalOrders: 423,
  salesGrowth: 12.5,
  productGrowth: 3.2,
  customerGrowth: 8.1,
  orderGrowth: 15.3
};

// Mock Payment Methods
export const mockPaymentMethods: PaymentMethod[] = [
  
];