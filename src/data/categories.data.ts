import { Category } from '@/models/interfaces/categories.interface';

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Exquisite necklaces for every occasion',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/NECKLACES.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnb2xkJTIwbmVja2xhY2UlMjBqZXdlbHJ5JTIwZWxlZ2FudHxlbnwxfHx8fDE3NTkxMjA1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 1,
    parent_id: null,
    children: []
  },
  {
    id: 2,
    name: 'Traditional Chains',
    slug: 'traditional-chains',
    description: 'Classic traditional gold chains with timeless designs',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/Traditional%20Chains/Traditional%20chains%20banner.JPG?fit=crop&crop=bottom&fp-y=1.0&w=1080&q=80',
    is_active: true,
    sort_order: 2,
    parent_id: null,
    children: []
  },
  {
    id: 3,
    name: 'Casual Chains',
    slug: 'casual-chains',
    description: 'Modern casual chains for everyday elegance',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/Casual%20Chains/Causal%20Chains%20Banner.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtb2Rlcm4lMjBnb2xkJTIwY2hhaW4lMjBqZXdlbHJ5JTIwbWluaW1hbHxlbnwxfHx8fDE3NTkxMjA1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 3,
    parent_id: null,
    children: []
  },
  {
    id: 4,
    name: 'Mangalsutra',
    slug: 'mangalsutra',
    description: 'Sacred and elegant mangalsutra designs',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/MANGALSUTRA2.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBtb2Rlcm4lMjBnb2xkJTIwY2hhaW4lMjBqZXdlbHJ5JTIwbWluaW1hbHxlbnwxfHx8fDE3NTkxMjA1Nzl8MA&ixlib=rb-4.1.0&q=90&w=1080',
    is_active: true,
    sort_order: 4,
    parent_id: null,
    children: []
  },
  {
    id: 5,
    name: 'Earrings',
    slug: 'earrings',
    description: 'Beautiful earrings to complement your style',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/EARRINGS.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwZWFycmluZ3MlMjBqZXdlbHJ5JTIwZWxlZ2FudCUyMGx1eHVyeXxlbnwxfHx8fDE3NTkxMjA1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 5,
    parent_id: null,
    children: []
  },
  {
    id: 6,
    name: 'Bangles',
    slug: 'bangles',
    description: 'Traditional and modern bangles collection',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/BANGLES.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmFuZ2xlcyUyMGluZGlhbiUyMGpld2VscnklMjB0cmFkaXRpb25hbHxlbnwxfHx8fDE3NTkxMjA1OTB8MA&ixlib=rb-4.1.0&q=100&w=1080',
    is_active: true,
    sort_order: 6,
    parent_id: null,
    children: []
  },
  {
    id: 7,
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelets for sophisticated looks',
    image: 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/BRACELETS.JPG?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYnJhY2VsZXRzJTIwamV3ZWxyeSUyMGx1eHVyeSUyMGVsZWdhbnR8ZW58MXx8fHwxNzU5MTIwNTk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 7,
    parent_id: null,
    children: []
  },
  {
    id: 8,
    name: 'Rings, Anklets, Nosepins',
    slug: 'rings-anklets-nosepins',
    description: 'Complete collection of rings, anklets and nosepins',
    image: 'https://images.unsplash.com/photo-1640324227718-f997fe8e9478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwcmluZ3MlMjBhbmtsZXRzJTIwbm9zZXBpbnMlMjBqZXdlbHJ5JTIwc2V0fGVufDF8fHx8MTc1OTEyMDU5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 8,
    parent_id: null,
    children: []
  },
  /* GIFT HAMPER CATEGORY - COMMENTED OUT FOR LATER USE
  {
    id: 10,
    name: 'Gift Hamper',
    slug: 'gift-hamper',
    description: 'Luxury jewelry gift collections',
    image: 'https://images.unsplash.com/photo-1582803112160-1e4418e285a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwZ2lmdCUyMGhhbXBlciUyMGNvbGxlY3Rpb24lMjBib3h8ZW58MXx8fHwxNzU5MTIwNjAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    is_active: true,
    sort_order: 8,
    parent_id: null,
    children: []
  }
  */
];

// Helper function to get all categories flattened (including children)
export const getAllCategories = (): Category[] => {
  const allCategories: Category[] = [];
  
  mockCategories.forEach(category => {
    allCategories.push(category);
    if (category.children && category.children.length > 0) {
      allCategories.push(...category.children);
    }
  });
  
  return allCategories;
};

// Helper function to get categories for homepage display
export const getHomepageCategories = (): Category[] => {
  return mockCategories.filter(category => category.is_active);
};

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return getAllCategories().find(category => category.slug === slug);
};

// Helper function to get main categories (for navigation)
export const getMainCategories = (): Category[] => {
  return mockCategories;
};