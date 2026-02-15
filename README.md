# Vauria - Modern E-Commerce Jewelry Platform

![Vauria Logo](public/logo.png)

> **Crafted for Queens** - A sophisticated, AI-powered jewelry e-commerce platform built with modern web technologies

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Key Features Deep Dive](#key-features-deep-dive)
- [Development Guide](#development-guide)
- [API Integration](#api-integration)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Vauria is a cutting-edge e-commerce platform specializing in jewelry, featuring AI-powered virtual try-on capabilities, advanced product filtering, and a seamless shopping experience. Built with Next.js 14 and TypeScript, it leverages modern React patterns, server-side rendering, and a sophisticated component-driven architecture.

### Why Vauria?

- **Modern Stack**: Built with Next.js 14 App Router, React 18, and TypeScript 5
- **AI-Powered**: Virtual jewelry try-on using advanced image generation
- **Accessible**: Uses Radix UI primitives for full accessibility compliance
- **Responsive**: Mobile-first design with optimized experiences across all devices
- **Type-Safe**: Full TypeScript coverage for enhanced developer experience
- **Performance**: Optimized with SSR, code splitting, and image optimization

---

## ✨ Features

### Core E-Commerce Functionality

- ✅ **Product Catalog**
  - Dynamic category browsing with nested subcategories
  - Advanced filtering and sorting options
  - High-performance product listings with pagination
  - SEO-friendly URLs with slug-based routing

- 🛒 **Shopping Cart**
  - Real-time cart updates with WebSocket-like reactivity
  - Persistent cart across sessions
  - Quantity management with instant feedback
  - Cart count badge with live updates

- 🔐 **Authentication & User Management**
  - Secure JWT-based authentication
  - Automatic session expiry detection and handling
  - Role-based access control (User/Admin)
  - Profile management with order history

- 💳 **Checkout & Payment**
  - Multi-step checkout process
  - Address management
  - Multiple payment methods (COD, Online)
  - Order tracking and management

- 🔍 **Search & Discovery**
  - Real-time product search
  - Category filtering
  - Sort by price, popularity, newest
  - Smart search with query highlighting

### Advanced Features

- 🤖 **AI Jewelry Try-On**
  - Upload user photos
  - Virtually try on jewelry pieces
  - Image generation service integration

- 💝 **Wishlist Management**
  - Save favorite products
  - Quick add to cart from wishlist
  - Persistent across sessions

- 🎨 **Theme Support**
  - Dark mode (default)
  - CSS variable-based theming
  - Smooth theme transitions

- 📱 **Responsive Design**
  - Mobile-optimized navigation
  - Touch-friendly interactions
  - Adaptive layouts for all screen sizes

- ⚡ **Performance Optimizations**
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - Automatic code splitting
  - Image optimization with Next.js Image
  - Lazy loading components

---

## 🛠 Tech Stack

### Core Framework & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.33 | React framework with App Router |
| **React** | 18.3.1 | UI library with modern hooks |
| **TypeScript** | 5.x | Static typing and enhanced DX |
| **Node.js** | LTS | Runtime environment |

### UI & Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | v4 - Utility-first CSS framework |
| **Radix UI** | 35+ accessible, unstyled UI primitives |
| **Shadcn/UI** | Pre-built component library |
| **Lucide React** | 500+ beautiful SVG icons |
| **Framer Motion** | Production-ready animations |

### State & Form Management

- **React Context API** - Global state management
- **React Hook Form** - Form validation and management
- **Local Storage Service** - Client-side persistence

### Development Tools

- **ESLint 9** - Code linting and quality
- **PostCSS** - CSS post-processing
- **Next Themes** - Theme switching system

### Animation & UI Libraries

- **Embla Carousel** - Touch-friendly carousel
- **Class Variance Authority** - Component variant management
- **React Resizable Panels** - Flexible panel layouts
- **Recharts** - Data visualization
- **Sonner** - Beautiful toast notifications

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git** (for version control)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/vauria_front_end.git
cd vauria_front_end
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Backend API Base URL
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000

# Optional: Analytics, etc.
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
vauria_front_end/
├── docs/                           # Comprehensive documentation
│   ├── architecture.md             # System architecture details
│   ├── routing-concept.md          # Routing patterns and best practices
│   ├── state--management.md        # State management and auth guards
│   ├── session-expiry-guide.md     # Session handling
│   └── pagination-handling.md      # Pagination implementation guide
│
├── public/                         # Static assets
│   ├── favicon.png                 # Site favicon
│   └── logo.png                    # Brand logo
│
├── src/
│   ├── app/                        # Next.js App Router (Pages)
│   │   ├── layout.tsx              # Root layout with global providers
│   │   ├── page.tsx                # Home page (/)
│   │   ├── [categorySlug]/         # Dynamic category routes
│   │   │   ├── page.tsx            # Category listing
│   │   │   └── [productSlug]/      # Nested product routes
│   │   │       └── page.tsx        # Product detail page
│   │   ├── cart/                   # Shopping cart page
│   │   ├── checkout/               # Checkout flow
│   │   ├── login/                  # Authentication page
│   │   ├── profile/                # User dashboard
│   │   ├── search/                 # Search results
│   │   ├── try-on/                 # AI jewelry try-on
│   │   ├── payment/                # Payment processing
│   │   ├── shipping/               # Shipping information
│   │   ├── returns/                # Returns policy
│   │   ├── care-instructions/      # Jewelry care guide
│   │   ├── contact/                # Contact page
│   │   └── dashboard/              # Admin dashboard
│   │
│   ├── components/
│   │   ├── ui/                     # 40+ Base UI components (Shadcn/UI)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (35+ more)
│   │   │
│   │   ├── general/                # Business logic components
│   │   │   ├── Header.tsx          # Main navigation header
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── ProductCard.tsx     # Product display card
│   │   │   ├── CategoryCard.tsx    # Category display
│   │   │   ├── CartPage.tsx        # Cart functionality
│   │   │   ├── CheckoutPage.tsx    # Checkout flow
│   │   │   ├── HomePage.tsx        # Home page content
│   │   │   ├── LoginPage.tsx       # Login form
│   │   │   ├── SearchPage.tsx      # Search interface
│   │   │   ├── Pagination.tsx      # Pagination controls
│   │   │   └── ... (more pages)
│   │   │
│   │   ├── layout/
│   │   │   └── MainLayout.tsx      # Main app wrapper with providers
│   │   │
│   │   └── figma/
│   │       └── ImageWithFallback.tsx  # Image component with fallback
│   │
│   ├── context/
│   │   └── MainContext.tsx         # Global app state & navigation
│   │
│   ├── services/                   # Business logic & API calls
│   │   ├── auth.service.ts         # Authentication
│   │   ├── cart.service.ts         # Shopping cart
│   │   ├── category.service.ts     # Category management
│   │   ├── checkout.service.ts     # Checkout process
│   │   ├── dashboard.service.ts    # Admin dashboard
│   │   ├── home.service.ts         # Home page data
│   │   ├── http.service.ts         # HTTP client with session handling
│   │   ├── imageGeneration.service.ts  # AI try-on
│   │   ├── localStorage.service.ts # Local storage wrapper
│   │   ├── orders.service.ts       # Order management
│   │   ├── payment.service.ts      # Payment processing
│   │   ├── product.service.ts      # Product operations
│   │   ├── profile.service.ts      # User profile
│   │   ├── search.service.ts       # Search functionality
│   │   ├── about.service.ts        # About page data
│   │   └── wishlist.service.ts     # Wishlist management
│   │
│   ├── models/interfaces/          # TypeScript type definitions
│   │   ├── product.interface.ts
│   │   ├── categories.interface.ts
│   │   ├── imageGeneration.interface.ts
│   │   └── ... (more interfaces)
│   │
│   ├── data/                       # Mock/static data
│   │   ├── products.data.ts
│   │   ├── categories.data.ts
│   │   ├── about.data.ts
│   │   └── footer.data.ts
│   │
│   ├── constants/                  # App constants
│   │   ├── messages.constants.ts   # UI messages
│   │   ├── product.messages.ts     # Product messages
│   │   ├── about.messages.ts       # About page content
│   │   └── routes/
│   │       └── routes.constants.ts # API route definitions
│   │
│   ├── lib/utils/                  # Utility functions
│   │   └── auth.util.ts
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   └── styles/
│       └── globals.css             # Global styles & CSS variables
│
├── .env.local                      # Environment variables (create this)
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS configuration
├── package.json                    # Dependencies & scripts
├── CART_USAGE_EXAMPLE.md          # Cart service usage guide
└── README.md                       # This file
```

---

## 🏗 Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────┐
│        Presentation Layer                   │
│   (Pages, Components, Context)              │
├─────────────────────────────────────────────┤
│        Service Layer                        │
│   (Business Logic, API Calls)               │
├─────────────────────────────────────────────┤
│        Data Layer                           │
│   (Interfaces, Constants, Mock Data)        │
└─────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (layout.tsx)
├── MainContextProvider (Global state)
│   └── MainLayout
│       ├── Header (Navigation & Auth)
│       ├── Main Content (Route-specific pages)
│       └── Footer (Links & Info)
└── Toast System (Notifications)
```

### State Management

- **Global State**: `MainContext` manages authentication, navigation, and cart
- **Local State**: Component-level `useState` for UI interactions
- **Form State**: React Hook Form for complex forms
- **Server State**: Service layer with API integration

### Data Flow

```
User Action → Component → Context Handler → Service → API → Response → State Update → UI Refresh
```

### Routing Architecture

**File-Based Routing** with Next.js 14 App Router:

- Static Routes: `/cart`, `/checkout`, `/login`, `/profile`
- Dynamic Routes: `[categorySlug]` for categories
- Nested Routes: `[categorySlug]/[productSlug]` for products
- Search Params: `/search?q=query`

**Navigation Flow**:

```
User Interaction → Header Component → MainContext → useRouter() → Next.js Navigation
```

Key navigation features:
- Centralized navigation logic in `MainContext`
- Protected routes with auth guards
- Automatic session expiry handling
- Redirect after login support

---

## 🎯 Key Features Deep Dive

### 1. Authentication System

**Features:**
- JWT-based authentication with automatic session management
- Role-based access control (User/Admin)
- Protected routes with automatic redirect
- Session expiry detection and handling
- Inline login modal on home page
- Full login page for other routes

**Flow:**
```
Login → Token Storage → Profile Fetch → Context Update → Route Protection
```

**Implementation:**
- `auth.service.ts` - Authentication logic
- `MainContext.tsx` - Auth state management
- `http.service.ts` - Automatic token injection & expiry detection

### 2. Shopping Cart System

**Features:**
- Real-time cart updates with subscription pattern
- Persistent cart across sessions
- Cart count badge with live updates
- Optimistic UI updates
- API synchronization with fallback

**Architecture:**
```typescript
// Cart Service Pattern
class CartService {
  private cartCountListeners: ((count: number) => void)[] = [];
  
  subscribeToCartCount(callback: (count: number) => void) {
    this.cartCountListeners.push(callback);
    return () => { /* unsubscribe */ };
  }
}

// Usage in MainContext
useEffect(() => {
  const unsubscribe = cartService.subscribeToCartCount((count) => {
    setCartItemCount(count);
  });
  return unsubscribe;
}, []);
```

**See**: `CART_USAGE_EXAMPLE.md` for detailed usage guide

### 3. AI Jewelry Try-On

**Features:**
- Upload user photos
- AI-powered image generation
- Virtual jewelry overlay
- Preview before purchase

**Integration:**
- `imageGeneration.service.ts` - API integration
- `/try-on` page - User interface
- Protected route (requires login)

### 4. Product Catalog & Search

**Features:**
- Dynamic category filtering
- Multi-level category navigation
- Real-time search with query highlighting
- Sort by price, popularity, newest
- Pagination with page controls

**Implementation:**
- File-based dynamic routes: `[categorySlug]/page.tsx`
- Search params for filters and pagination
- Optimized product loading with SSR

### 5. Session Expiry Handling

**Automatic Detection:**
- `http.service.ts` monitors all API responses
- Detects 401/403 with token expiry messages
- Triggers automatic logout flow
- Redirects to login with message

**User Experience:**
```
API Returns 401 → Session Expiry Detected → Auto Logout → Redirect to Login
                                                ↓
                                    "Your session has expired. Please login again."
```

### 6. Responsive Design

**Mobile-First Approach:**
- Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Mobile navigation drawer with category accordion
- Touch-optimized interactions
- Adaptive component layouts

**Desktop Enhancements:**
- Dropdown mega menus
- Hover effects and animations
- Multi-column layouts
- Enhanced filtering UI

---

## 💻 Development Guide

### Code Organization Principles

1. **Separation of Concerns**
   - UI components (presentation) separate from business logic
   - Service layer handles all API calls
   - Context manages global state

2. **Type Safety**
   - All data models defined in `models/interfaces/`
   - Service methods return typed responses
   - Props interfaces for all components

3. **Reusability**
   - Atomic design pattern for components
   - Shared utilities in `lib/utils/`
   - Consistent styling with Tailwind

### Adding a New Feature

**Example: Adding a Reviews Feature**

1. **Create Interface** (`src/models/interfaces/review.interface.ts`)
```typescript
export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}
```

2. **Create Service** (`src/services/review.service.ts`)
```typescript
class ReviewService {
  async getProductReviews(productId: number): Promise<Review[]> {
    const response = await httpService.get(
      `${BACKEND_ROUTES.PRODUCTS}/${productId}/reviews`
    );
    return await response.json();
  }
}

export const reviewService = new ReviewService();
```

3. **Create Component** (`src/components/general/ReviewsList.tsx`)
```typescript
'use client';

export function ReviewsList({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  
  useEffect(() => {
    reviewService.getProductReviews(productId).then(setReviews);
  }, [productId]);
  
  return (/* JSX */);
}
```

4. **Add to Product Page**
```typescript
import { ReviewsList } from '@/components/general/ReviewsList';

export default function ProductPage({ params }) {
  return (
    <div>
      {/* Product details */}
      <ReviewsList productId={product.id} />
    </div>
  );
}
```

### Best Practices

1. **Components**
   - Use `'use client'` only when necessary (state, effects, browser APIs)
   - Keep components focused and single-purpose
   - Use TypeScript interfaces for props
   - Extract repeated logic into custom hooks

2. **Styling**
   - Use Tailwind utility classes
   - Follow mobile-first approach
   - Use CSS variables for theming
   - Consistent spacing with Tailwind scale

3. **State Management**
   - Local state for UI interactions
   - Context for global app state
   - Services for server state
   - Avoid prop drilling with Context

4. **Performance**
   - Use `useCallback` for event handlers passed as props
   - `useMemo` for expensive computations
   - Lazy load heavy components
   - Optimize images with Next.js Image

5. **Error Handling**
   - Try-catch in async functions
   - User-friendly error messages
   - Toast notifications for feedback
   - Fallback UI for errors

### Testing (Coming Soon)

Future integration planned for:
- Jest for unit testing
- React Testing Library for component tests
- Playwright/Cypress for E2E tests

---

## 🔌 API Integration

### Backend Routes

The application connects to a backend API. All routes are defined in `src/constants/routes/routes.constants.ts`:

```typescript
export const BACKEND_ROUTES = {
  // Authentication
  LOGIN: `${BASE_URL}/api/v1/login`,
  SIGNUP: `${BASE_URL}/api/v1/signup`,
  
  // Products
  PRODUCTS: `${BASE_URL}/api/v1/products`,
  PRODUCT_BY_ID: (id: number) => `${BASE_URL}/api/v1/products/${id}`,
  PRODUCTFROMSLUG: (slug: string) => `${BASE_URL}/api/v1/products/slug/${slug}`,
  
  // Cart
  CART: `${BASE_URL}/api/v1/cart/`,
  CART_ITEMS: `${BASE_URL}/api/v1/cart/items`,
  CART_ITEM_DELETE: (itemId: string) => `${BASE_URL}/api/v1/cart/items/${itemId}`,
  CART_ITEM_UPDATE: (itemId: string) => `${BASE_URL}/api/v1/cart/items/${itemId}`,
  
  // User
  USER_PROFILE: `${BASE_URL}/api/v1/me`,
  USER_ADDRESSES: `${BASE_URL}/api/v1/me/addresses`,
  
  // Orders
  ORDERS: `${BASE_URL}/api/v1/orders/`,
  ORDERS_ME: `${BASE_URL}/api/v1/orders/me`,
  ORDERS_COD: `${BASE_URL}/api/v1/orders/cod`,
  ORDERS_ONLINE: `${BASE_URL}/api/v1/orders/online`,
  
  // Payments
  PAYMENTS_CREATE: `${BASE_URL}/api/v1/payments/create`,
  PAYMENTS_VERIFY: `${BASE_URL}/api/v1/payments/verify`,
  
  // Shipping & Discounts
  SHIPPING_RATES: `${BASE_URL}/api/v1/orders/shipping/rates`,
  DISCOUNT_VALIDATE: `${BASE_URL}/api/v1/discounts/validate`,
};
```

### HTTP Service

All API calls go through `httpService` which provides:
- Automatic JWT token injection
- Session expiry detection
- Consistent error handling
- TypeScript type safety

```typescript
// Example usage in a service
async getProducts(): Promise<Product[]> {
  const response = await httpService.get(BACKEND_ROUTES.PRODUCTS);
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
}
```

### Environment Variables

Required environment variables in `.env.local`:

```env
# Required
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_GTM_ID=your_gtm_id
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

1. **[architecture.md](docs/architecture.md)**
   - Detailed system architecture
   - Tech stack breakdown
   - Component patterns
   - Data flow diagrams
   - Performance optimizations

2. **[routing-concept.md](docs/routing-concept.md)**
   - File-based routing guide
   - Dynamic routes explained
   - Navigation patterns
   - Client vs Server components
   - Adding new routes

3. **[state--management.md](docs/state--management.md)**
   - Authentication flow
   - Auth guard patterns
   - State management strategy
   - Context API usage

4. **[session-expiry-guide.md](docs/session-expiry-guide.md)**
   - Automatic session handling
   - Token expiry detection
   - User experience flow
   - Implementation details

5. **[pagination-handling.md](docs/pagination-handling.md)**
   - Pagination implementation
   - Backend response format
   - Offset vs cursor pagination
   - Frontend integration

6. **[CART_USAGE_EXAMPLE.md](CART_USAGE_EXAMPLE.md)**
   - Cart service usage
   - Real-time updates
   - Subscription pattern
   - Code examples

---

## 🎨 Styling & Theming

### Tailwind CSS Configuration

The project uses **Tailwind CSS v4** with PostCSS:

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### CSS Variables

Dark theme defined in `src/styles/globals.css`:

```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --primary: 0 0% 98%;
  /* ... more variables */
}
```

### Component Variants

Using Class Variance Authority for component variants:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input",
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
  }
);
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration

Ensure these environment variables are set in your deployment platform:

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Your backend API URL

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards

- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Build fails with CSS/Tailwind errors**
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

**Issue: Environment variables not working**
- Ensure `.env.local` exists and has correct values
- Variables must start with `NEXT_PUBLIC_` for client-side access
- Restart dev server after changing env variables

**Issue: Authentication not working**
- Check `NEXT_PUBLIC_BACKEND_BASE_URL` is correct
- Verify backend API is running
- Clear browser localStorage and cookies

**Issue: Cart count not updating**
- Check browser console for errors
- Verify backend cart API is responding
- Try clearing cart and adding items again

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👥 Team & Support

For questions or support, please contact:
- **Email**: support@vauria.com
- **Documentation**: See `docs/` folder
- **Issues**: Open an issue on GitHub

---

## 🎯 Roadmap

### Phase 1 - Current (Completed ✅)
- [x] Core e-commerce functionality
- [x] Authentication & user management
- [x] Shopping cart with real-time updates
- [x] Product catalog and search
- [x] Checkout and payment flow
- [x] AI jewelry try-on
- [x] Responsive design
- [x] Session expiry handling

### Phase 2 - Upcoming
- [ ] Admin dashboard enhancements
- [ ] Order tracking and notifications
- [ ] Product reviews and ratings
- [ ] Wishlist sharing
- [ ] Email notifications
- [ ] Advanced analytics

### Phase 3 - Future
- [ ] Multi-language support (i18n)
- [ ] Currency conversion
- [ ] Social authentication (Google, Facebook)
- [ ] Loyalty program
- [ ] Gift cards
- [ ] Live chat support

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Hosting and deployment
- **Radix UI** - Accessible component primitives
- **Shadcn** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling

---

**Built with ❤️ by the Vauria Team**

*Last Updated: February 2026*
