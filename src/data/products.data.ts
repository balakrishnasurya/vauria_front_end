// Import interfaces from the new interfaces folder
import { Product, Banner, SortOption, FilterOptions, CategoryProducts, User, Order, OrderItem, Address, PaymentMethod, CheckoutData, DashboardStats, GenerationTemplate, ImageGenerationRequest, ImageGenerationResponse, ApiResponse } from '../interfaces/product.interface';

// Interfaces are now imported from the interfaces folder

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Royal Sapphire Diamond Ring",
    slug: "royal-sapphire-diamond-ring",
    description: "An exquisite masterpiece featuring a 2-carat Ceylon sapphire surrounded by brilliant-cut diamonds. This ring embodies timeless elegance and royal sophistication, perfect for life's most precious moments.",
    price: 145000,
    offer_price: 125000,
    stock: 3,
    material: "18K White Gold",
    weight: 4.2,
    dimensions: "15mm x 12mm x 8mm",
    is_active: true,
    featured: true,
    category_id: 1, // rings category
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    created_at: "2024-01-15T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603561596112-db8aea8bc321?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Stone": "2ct Ceylon Sapphire",
      "Setting": "Prong Setting",
      "Band Width": "2.5mm",
      "Ring Size": "Adjustable (5-8)",
      "Certification": "GIA Certified",
      "Origin": "Ceylon (Sri Lanka)"
    },
    care_instructions: [
      "Clean with soft brush and mild soap solution",
      "Store separately to avoid scratches",
      "Avoid exposure to harsh chemicals",
      "Professional cleaning recommended every 6 months"
    ],
    tags: ["luxury", "sapphire", "diamond", "engagement", "royal"]
  },
  {
    id: 2,
    name: "Vintage Pearl Drop Earrings",
    slug: "vintage-pearl-drop-earrings",
    description: "Elegant South Sea pearl earrings with Art Deco inspired design. These lustrous pearls are complemented by delicate diamond accents, creating a sophisticated piece perfect for formal occasions.",
    price: 95000,
    offer_price: 85000,
    stock: 7,
    material: "18K Yellow Gold",
    weight: 6.8,
    dimensions: "35mm x 12mm",
    is_active: true,
    featured: true,
    category_id: 2, // earrings category
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
    created_at: "2024-01-10T08:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Pearl Type": "South Sea Pearls",
      "Pearl Size": "10-11mm",
      "Lustre": "AAA High Lustre",
      "Setting Style": "Art Deco",
      "Closure": "Post & Butterfly Back",
      "Total Length": "35mm"
    },
    care_instructions: [
      "Wipe with soft cloth after wearing",
      "Avoid contact with perfumes and cosmetics",
      "Store in soft pouch separately",
      "Clean only with damp cloth, no harsh chemicals"
    ],
    tags: ["vintage", "pearl", "elegant", "formal", "art-deco"]
  },
  {
    id: 3,
    name: "Emerald Tennis Bracelet",
    slug: "emerald-tennis-bracelet",
    description: "A stunning tennis bracelet featuring premium emeralds set in white gold. Each stone is carefully selected for its vibrant color and clarity, creating a luxurious piece that catches the light beautifully.",
    price: 95000,
    offer_price: null, // No offer price
    stock: 0, // Out of stock to demonstrate functionality
    material: "18K White Gold",
    weight: 12.5,
    dimensions: "18cm length x 5mm width",
    is_active: true,
    featured: false,
    category_id: 3, // bracelets category
    image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop",
    created_at: "2024-01-12T12:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Stone Count": "24 Emeralds",
      "Total Carat Weight": "8.5ct",
      "Stone Grade": "AA+ Quality",
      "Clasp Type": "Box Clasp with Safety",
      "Bracelet Length": "18cm (adjustable)",
      "Setting": "Channel Setting"
    },
    care_instructions: [
      "Clean with soft brush and warm water",
      "Avoid ultrasonic cleaning",
      "Store flat to prevent tangling",
      "Check clasp regularly for security"
    ],
    tags: ["emerald", "tennis", "luxury", "green", "formal"]
  },
  {
    id: 4,
    name: "Diamond Solitaire Necklace",
    slug: "diamond-solitaire-necklace",
    description: "A timeless diamond solitaire necklace featuring a brilliant-cut diamond suspended from a delicate gold chain. Perfect for everyday elegance or special occasions.",
    price: 85000,
    offer_price: 75000,
    stock: 8,
    material: "18K Rose Gold",
    weight: 3.2,
    dimensions: "45cm chain length",
    is_active: true,
    featured: true,
    category_id: 4, // necklaces category
    image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    created_at: "2024-01-08T14:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603561596112-db8aea8bc321?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Diamond Weight": "1.5ct",
      "Diamond Cut": "Round Brilliant",
      "Diamond Clarity": "VS1",
      "Diamond Color": "G",
      "Chain Length": "45cm",
      "Chain Type": "Cable Chain"
    },
    care_instructions: [
      "Clean with jewelry cleaning solution",
      "Store in original box or soft pouch",
      "Avoid wearing during sports or swimming",
      "Professional inspection annually"
    ],
    tags: ["diamond", "solitaire", "classic", "elegant", "rose-gold"]
  },
  {
    id: 5,
    name: "Ruby Chandelier Earrings",
    slug: "ruby-chandelier-earrings",
    description: "Magnificent chandelier earrings featuring genuine rubies and diamonds in an intricate gold setting. These statement pieces are perfect for special occasions and formal events.",
    price: 110000,
    offer_price: null,
    stock: 4,
    material: "22K Yellow Gold",
    weight: 8.9,
    dimensions: "55mm x 20mm",
    is_active: true,
    featured: false,
    category_id: 2, // earrings category
    image_url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop",
    created_at: "2024-01-05T16:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Ruby Count": "12 Rubies",
      "Ruby Origin": "Burmese",
      "Diamond Accent": "24 diamonds",
      "Total Weight": "15.5ct",
      "Setting Style": "Chandelier",
      "Back Type": "Screw Back"
    },
    care_instructions: [
      "Handle with care due to intricate design",
      "Clean with soft brush only",
      "Store in padded jewelry box",
      "Avoid contact with harsh chemicals"
    ],
    tags: ["ruby", "chandelier", "statement", "formal", "traditional"]
  },
  {
    id: 6,
    name: "Gold Wedding Band Set",
    slug: "gold-wedding-band-set",
    description: "A beautiful matching wedding band set crafted in premium gold. Perfect for couples who want to symbolize their eternal bond with matching rings.",
    price: 45000,
    offer_price: null,
    stock: 12,
    material: "18K Yellow Gold",
    weight: 8.4,
    dimensions: "6mm width each",
    is_active: true,
    featured: false,
    category_id: 1, // rings category
    image_url: "https://images.unsplash.com/photo-1603561596112-db8aea8bc321?w=800&h=800&fit=crop",
    created_at: "2024-01-03T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1603561596112-db8aea8bc321?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Ring Width": "6mm",
      "Set Includes": "2 Rings",
      "Finish": "High Polish",
      "Comfort Fit": "Yes",
      "Engraving": "Available",
      "Size Range": "4-12"
    },
    care_instructions: [
      "Clean regularly with mild soap",
      "Polish with jewelry cloth",
      "Store separately to avoid scratches",
      "Remove during manual work"
    ],
    tags: ["wedding", "band", "couple", "gold", "matching", "classic"]
  },
  {
    id: 7,
    name: "Silver Chain Bracelet",
    slug: "silver-chain-bracelet",
    description: "A delicate silver chain bracelet perfect for everyday wear. Its minimalist design makes it suitable for both casual and formal occasions.",
    price: 15000,
    offer_price: null,
    stock: 20,
    material: "925 Sterling Silver",
    weight: 4.2,
    dimensions: "19cm length x 3mm width",
    is_active: true,
    featured: false,
    category_id: 3, // bracelets category
    image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop",
    created_at: "2024-01-01T08:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Material": "925 Sterling Silver",
      "Chain Type": "Cable Chain",
      "Clasp": "Lobster Clasp",
      "Length": "19cm",
      "Adjustable": "Yes (17-19cm)",
      "Hypoallergenic": "Yes"
    },
    care_instructions: [
      "Clean with silver polishing cloth",
      "Avoid exposure to lotions and perfumes",
      "Store in anti-tarnish bag",
      "Remove before swimming or showering"
    ],
    tags: ["silver", "chain", "minimalist", "everyday", "casual", "affordable"]
  },
  {
    id: 8,
    name: "Platinum Engagement Ring",
    slug: "platinum-engagement-ring",
    description: "An exquisite platinum engagement ring featuring a brilliant round diamond. The perfect symbol of eternal love and commitment.",
    price: 185000,
    offer_price: null,
    stock: 6,
    material: "Platinum 950",
    weight: 5.8,
    dimensions: "8mm crown x 2.5mm band",
    is_active: true,
    featured: true,
    category_id: 1, // rings category
    image_url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=800&fit=crop",
    created_at: "2024-01-02T14:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Center Stone": "2ct Round Diamond",
      "Diamond Grade": "D/VVS1",
      "Certification": "GIA Certified",
      "Setting": "Six-Prong Solitaire",
      "Band Width": "2.5mm",
      "Metal Purity": "95% Platinum"
    },
    care_instructions: [
      "Professional cleaning every 6 months",
      "Store in original ring box",
      "Avoid wearing during physical activities",
      "Inspect prongs annually for security"
    ],
    tags: ["platinum", "engagement", "diamond", "solitaire", "luxury", "premium"]
  },
  {
    id: 9,
    name: "Gemstone Pendant Necklace",
    slug: "gemstone-pendant-necklace",
    description: "A stunning necklace featuring a vibrant gemstone pendant. The colorful stone is beautifully set in gold and hangs from a delicate chain.",
    price: 55000,
    offer_price: null,
    stock: 9,
    material: "14K White Gold",
    weight: 6.1,
    dimensions: "40cm chain with 2cm pendant",
    is_active: true,
    featured: false,
    category_id: 4, // necklaces category
    image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    created_at: "2024-01-04T11:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1603561596112-db8aea8bc321?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Gemstone": "Amethyst",
      "Stone Size": "12x10mm",
      "Chain Length": "40cm",
      "Pendant Size": "20x15mm",
      "Clasp Type": "Spring Ring",
      "Stone Cut": "Oval"
    },
    care_instructions: [
      "Clean gemstone with soft brush",
      "Avoid exposure to heat",
      "Store pendant separately",
      "Check chain links regularly"
    ],
    tags: ["gemstone", "pendant", "amethyst", "colorful", "elegant", "gift"]
  },
  {
    id: 10,
    name: "Diamond Stud Earrings",
    slug: "diamond-stud-earrings",
    description: "Classic diamond stud earrings that are perfect for any occasion. These timeless pieces feature brilliant-cut diamonds in secure settings.",
    price: 65000,
    offer_price: null,
    stock: 15,
    material: "18K White Gold",
    weight: 2.4,
    dimensions: "6mm diameter each",
    is_active: true,
    featured: true,
    category_id: 2, // earrings category
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
    created_at: "2024-01-06T13:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop"
    ],
    specifications: {
      "Diamond Weight": "1ct total (0.5ct each)",
      "Diamond Cut": "Round Brilliant",
      "Diamond Clarity": "VS2",
      "Diamond Color": "H",
      "Setting": "Four-Prong",
      "Back Type": "Screw Back"
    },
    care_instructions: [
      "Clean with diamond cleaning solution",
      "Check settings regularly",
      "Store in earring box",
      "Professional cleaning recommended"
    ],
    tags: ["diamond", "stud", "classic", "versatile", "timeless", "everyday"]
  }
];

export const mockRecentlyViewed: Product[] = [
  mockProducts[1],
  mockProducts[3],
  mockProducts[5]
];

export const getSimilarProducts = (productId: string, categoryId: string): Product[] => {
  return mockProducts
    .filter(p => p.category_id === categoryId && p.id !== productId)
    .slice(0, 4);
};



// Banners Data
export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Celebrate Your Beauty With Every Ornament',
    subtitle: 'Discover timeless elegance',
    description: 'Exquisite sapphire jewelry crafted for queens',
    imageUrl: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/1.JPG?w=1200&h=600&fit=crop',
    ctaText: 'Shop Now',
    ctaLink: '/category/rings',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'banner-2',
    title: 'Elegant Jewelry Collection',
    subtitle: 'Timeless beauty for every occasion',
    description: 'Discover our exquisite pearl jewelry collection',
    imageUrl: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/2.JPG?w=1200&h=600&fit=crop',
    ctaText: 'Shop Now',
    ctaLink: '/category/earrings',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'banner-3',
    title: 'Radiant Collection',
    subtitle: 'Unleash your inner royalty',
    description: 'Explore our stunning ruby jewelry pieces',
    imageUrl: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/3.JPG?w=1200&h=600&fit=crop',
    ctaText: 'Shop Now',
    ctaLink: '/category/rings',
    isActive: true,
    displayOrder: 3
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
    { min: 200000, max: null, label: 'Above ₹2,00,000' }
  ]
};

// Sort options
export const mockSortOptions: SortOption[] = [
  'featured',
  'price-low-high',
  'price-high-low',
  'newest',
  'name-a-z',
  'name-z-a'
];

// Mock Users for Dashboard
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'isabella@example.com',
    firstName: 'Isabella',
    lastName: 'Martinez',
    phone: '+91 98765 43210',
    role: 'customer',
    createdAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 2,
    email: 'admin@vauria.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+91 99999 00000',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

// Mock Orders for Dashboard
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 1,
    items: [
      {
        productId: 1,
        productName: 'Royal Sapphire Diamond Ring',
        quantity: 1,
        price: 125000
      }
    ],
    total: 125000,
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00Z',
    shippingAddress: {
      street: '123 Royal Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    }
  }
];

// Category Products Mapping - Updated to match new categories structure
export const categoryMockData = {
  categoryProducts: {
    'necklaces': mockProducts.filter(p => p.category_id === 4 || p.category_id === 'necklaces'),
    'traditional-chains': [
      // Traditional chain products
      {
        id: 101,
        name: 'Heritage Gold Chain',
        slug: 'heritage-gold-chain',
        description: 'Traditional 22K gold chain with classic design',
        price: 125000,
        offer_price: null,
        stock: 5,
        material: '22K Yellow Gold',
        weight: 25.5,
        dimensions: '22 inches length',
        is_active: true,
        featured: true,
        category_id: 3,
        image_url: 'https://images.unsplash.com/photo-1601121141499-17ae80afc03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGdvbGQlMjBjaGFpbnMlMjBqZXdlbHJ5JTIwaW5kaWFufGVufDF8fHx8MTc1OTEyMDU3NXww&ixlib=rb-4.1.0&q=80&w=1080',
        created_at: '2024-01-15T10:00:00Z',
        images: [
          'https://images.unsplash.com/photo-1601121141499-17ae80afc03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGdvbGQlMjBjaGFpbnMlMjBqZXdlbHJ5JTIwaW5kaWFufGVufDF8fHx8MTc1OTEyMDU3NXww&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        specifications: {
          'Metal Purity': '22K Gold',
          'Chain Type': 'Traditional',
          'Weight': '25.5g',
          'Length': '22 inches',
          'Clasp': 'Traditional Lock'
        },
        care_instructions: [
          'Store in soft cloth pouch',
          'Clean with mild gold cleaner',
          'Avoid contact with chemicals',
          'Professional cleaning recommended'
        ],
        tags: ['traditional', 'gold', 'chain', 'heritage', 'classic']
      }
    ],
    'casual-chains': [
      // Casual chain products
      {
        id: 102,
        name: 'Modern Casual Chain',
        slug: 'modern-casual-chain',
        description: 'Contemporary 18K gold chain perfect for daily wear',
        price: 75000,
        offer_price: 65000,
        stock: 8,
        material: '18K Yellow Gold',
        weight: 15.2,
        dimensions: '20 inches length',
        is_active: true,
        featured: true,
        category_id: 4,
        image_url: 'https://images.unsplash.com/photo-1708220040954-a89dd8317a9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtb2Rlcm4lMjBnb2xkJTIwY2hhaW4lMjBqZXdlbHJ5JTIwbWluaW1hbHxlbnwxfHx8fDE3NTkxMjA1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        created_at: '2024-01-12T08:00:00Z',
        images: [
          'https://images.unsplash.com/photo-1708220040954-a89dd8317a9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtb2Rlcm4lMjBnb2xkJTIwY2hhaW4lMjBqZXdlbHJ5JTIwbWluaW1hbHxlbnwxfHx8fDE3NTkxMjA1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        specifications: {
          'Metal Purity': '18K Gold',
          'Chain Type': 'Cable Chain',
          'Weight': '15.2g',
          'Length': '20 inches',
          'Clasp': 'Lobster Clasp'
        },
        care_instructions: [
          'Clean with jewelry cloth',
          'Store separately to avoid tangles',
          'Avoid exposure to perfumes',
          'Professional cleaning as needed'
        ],
        tags: ['casual', 'modern', 'gold', 'chain', 'everyday']
      }
    ],
    'mangalsutra': [
      // Mangalsutra products
    ],
    'earrings': mockProducts.filter(p => p.category_id === 2 || p.category_id === 'earrings'),
    'bangles': [
      // Bangle products
    ],
    'bracelets': mockProducts.filter(p => p.category_id === 3 || p.category_id === 'bracelets'),
    'rings-anklets-nosepins': [
      // Combined products
      ...mockProducts.filter(p => p.category_id === 1 || p.category_id === 'rings')
    ],
    'gift-hamper': [
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
  {
    id: 'pm-cod',
    type: 'cod',
    isDefault: false
  },
  {
    id: 'pm-card-visa',
    type: 'card',
    provider: 'Visa',
    isDefault: false
  },
  {
    id: 'pm-card-mastercard',
    type: 'card',
    provider: 'Mastercard',
    isDefault: false
  },
  {
    id: 'pm-upi-gpay',
    type: 'upi',
    provider: 'Google Pay',
    isDefault: false
  },
  {
    id: 'pm-upi-paytm',
    type: 'upi',
    provider: 'Paytm',
    isDefault: false
  },
  {
    id: 'pm-netbanking',
    type: 'netbanking',
    isDefault: false
  }
];