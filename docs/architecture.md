# Vauria E-Commerce Project Architecture

## Overview

Vauria is a modern e-commerce jewelry platform built with Next.js 14, featuring AI-powered jewelry try-on capabilities, advanced filtering, and a sophisticated user experience. The application follows modern React patterns with TypeScript, server-side rendering, and a component-driven architecture.

---

## Tech Stack & Libraries

### **Core Framework & Runtime**
- **Next.js 14.2.33** - React framework with App Router for file-based routing and SSR/SSG
- **React 18.3.1** - UI library with hooks and modern patterns
- **TypeScript 5** - Static typing and enhanced developer experience
- **Node.js** - Runtime environment

### **UI & Styling**
- **Tailwind CSS v4** - Utility-first CSS framework with PostCSS integration
- **Radix UI** - Accessible, unstyled UI primitives (35+ components)
  - Dialogs, dropdowns, accordions, navigation, forms, etc.
- **Shadcn/UI** - Pre-built component library built on Radix UI
- **Lucide React** - Icon library with 500+ SVG icons
- **CSS Variables** - Dynamic theming system (light/dark modes)

### **Animation & Interactions**
- **Framer Motion** - Production-ready motion library for React
- **Class Variance Authority** - Component variant management
- **Embla Carousel** - Touch-friendly carousel component

### **State Management & Context**
- **React Context API** - Global state management for auth, cart, navigation
- **React Hook Form** - Form state management and validation
- **Local Storage Service** - Client-side data persistence

### **Development Tools**
- **ESLint 9** - Code linting and formatting
- **PostCSS** - CSS post-processing
- **Next Themes** - Theme switching system

---

## File Structure

```
vauria_front_end/
├── docs/                           # Documentation
│   ├── architecture.md             # This file
│   └── routing-concept.md           # Routing documentation
├── public/                         # Static assets
│   ├── logo.png                    # Brand assets
│   └── [other static files]
├── src/
│   ├── app/                        # Next.js App Router (Pages)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── [categorySlug]/         # Dynamic category routes
│   │   │   ├── page.tsx            # Category listing page
│   │   │   └── [productSlug]/      # Nested product routes
│   │   │       └── page.tsx        # Product detail page
│   │   ├── cart/page.tsx           # Shopping cart
│   │   ├── checkout/page.tsx       # Checkout process
│   │   ├── login/page.tsx          # Authentication
│   │   ├── profile/page.tsx        # User dashboard
│   │   ├── search/page.tsx         # Search results
│   │   ├── try-on/page.tsx         # AI jewelry try-on
│   │   └── payment/page.tsx        # Payment processing
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # Base UI components (Shadcn/UI)
│   │   │   ├── button.tsx          # Button variants
│   │   │   ├── card.tsx            # Card layouts
│   │   │   ├── dropdown-menu.tsx   # Dropdown menus
│   │   │   ├── dialog.tsx          # Modal dialogs
│   │   │   ├── form.tsx            # Form components
│   │   │   └── [30+ other components]
│   │   ├── general/                # Business logic components
│   │   │   ├── Header.tsx          # Main navigation
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── ProductCard.tsx     # Product display
│   │   │   ├── CategoryCard.tsx    # Category display
│   │   │   ├── CartPage.tsx        # Cart functionality
│   │   │   ├── CheckoutPage.tsx    # Checkout flow
│   │   │   └── [other pages]
│   │   ├── layout/                 # Layout components
│   │   │   └── MainLayout.tsx      # Main app wrapper
│   │   └── figma/                  # Design-specific components
│   │       └── ImageWithFallback.tsx
│   ├── context/                    # React Context providers
│   │   └── MainContext.tsx         # Global app state
│   ├── services/                   # Business logic & API calls
│   │   ├── auth.service.ts         # Authentication
│   │   ├── product.service.ts      # Product management
│   │   ├── cart.service.ts         # Shopping cart
│   │   ├── category.service.ts     # Category management
│   │   ├── search.service.ts       # Search functionality
│   │   ├── wishlist.service.ts     # Wishlist management
│   │   ├── checkout.service.ts     # Checkout process
│   │   ├── imageGeneration.service.ts # AI try-on
│   │   └── [other services]
│   ├── models/interfaces/          # TypeScript type definitions
│   │   ├── product.interface.ts    # Product types
│   │   ├── categories.interface.ts # Category types
│   │   └── imageGeneration.interface.ts # AI types
│   ├── data/                       # Mock data & static content
│   │   ├── products.data.ts        # Product mock data
│   │   ├── categories.data.ts      # Category mock data
│   │   └── about.data.ts           # Static content
│   ├── constants/                  # App constants
│   │   ├── messages.constants.ts   # UI messages
│   │   ├── product.messages.ts     # Product-specific messages
│   │   └── routes/
│   │       └── routes.constants.ts # Route definitions
│   ├── lib/utils/                  # Utility functions
│   │   └── auth.util.ts            # Auth utilities
│   ├── hooks/                      # Custom React hooks
│   └── styles/
│       └── globals.css             # Global styles & CSS variables
├── .env.local                      # Environment variables
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS configuration
└── package.json                    # Dependencies & scripts
```

---

## Architecture Patterns

### **1. Layered Architecture**

```
┌─────────────────────────────────────────┐
│               Presentation Layer         │
│  (Pages, Components, Context)           │
├─────────────────────────────────────────┤
│               Service Layer              │
│  (Business Logic, API Calls)           │
├─────────────────────────────────────────┤
│               Data Layer                 │
│  (Interfaces, Mock Data, Constants)    │
└─────────────────────────────────────────┘
```

### **2. Component Hierarchy**

```
App (layout.tsx)
├── MainLayout
│   ├── Header (with navigation & auth)
│   ├── Main Content (route-specific pages)
│   └── Footer (with links & info)
├── Context Providers
│   ├── ThemeProvider (dark/light mode)
│   └── MainContextProvider (global state)
└── Toast System (notifications)
```

### **3. State Management Pattern**

- **Global State**: MainContext (auth, navigation, cart count)
- **Local State**: Component-level useState for UI interactions
- **Form State**: React Hook Form for complex forms
- **Server State**: Service layer with mock data (future: API integration)

---

## Routing Architecture

### **File-Based Routing (Next.js App Router)**

The routing system uses Next.js 14's App Router with file-based routing:

- **Static Routes**: `/cart`, `/checkout`, `/login`, `/profile`, etc.
- **Dynamic Routes**: `[categorySlug]` for categories, `[productSlug]` for products
- **Nested Routes**: `[categorySlug]/[productSlug]` for product details
- **Search Params**: `/search?q=query` with `useSearchParams()`

### **Navigation Flow**

```
User Interaction → Header Component → MainContext → useRouter() → Next.js Navigation
```

**Key Components:**
- **Header**: UI-only component with event handlers
- **MainContext**: Centralized navigation logic with `useRouter()`
- **MainLayout**: Bridges Header with Context

### **Route Protection**
- Authentication state managed in MainContext
- Conditional navigation based on user status
- Profile dropdown shows different options for authenticated/unauthenticated users

---

## Key Technical Concepts

### **1. Component Architecture**

#### **Atomic Design Pattern**
- **Atoms**: UI components (`Button`, `Input`, `Card`)
- **Molecules**: Combined UI components (`ProductCard`, `CategoryCard`)
- **Organisms**: Complex components (`Header`, `Footer`)
- **Templates**: Layout components (`MainLayout`)
- **Pages**: Route-specific components

#### **Props vs Context**
- **Props**: UI-specific data (styling, content)
- **Context**: Global app state (auth, navigation, cart)
- **Service Layer**: Business logic separated from UI

### **2. TypeScript Integration**

#### **Interface-Driven Development**
```typescript
// models/interfaces/product.interface.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  // ... other properties
}

// Type-safe service methods
class ProductService {
  async getProducts(): Promise<Product[]> { /* ... */ }
}
```

#### **Generic Types**
```typescript
// Reusable response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
```

### **3. Animation System**

#### **Framer Motion Integration**
- **Page Transitions**: Smooth route changes
- **Component Animations**: Hover, tap, and scroll animations
- **Layout Animations**: Responsive design transitions
- **Stagger Effects**: Sequential animations for lists

```tsx
// Example: Staggered product grid animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};
```

### **4. Responsive Design**

#### **Mobile-First Approach**
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:` (Tailwind CSS)
- **Adaptive Components**: Different layouts for mobile/desktop
- **Touch Interactions**: Mobile-optimized gestures and animations

#### **Progressive Enhancement**
- **Server-Side Rendering**: Initial page load optimization
- **Client-Side Hydration**: Interactive features after load
- **Responsive Images**: Optimized loading with Next.js Image

---

## Data Flow

### **1. Request Flow**

```
User Action → Component Event → Context Handler → Service Method → Mock Data → UI Update
```

### **2. Authentication Flow**

```
Login Request → Auth Service → User Context → Navigation Update → UI Refresh
```

### **3. Product Search Flow**

```
Search Input → Search Service → Product Filtering → Results Display → Pagination
```

### **4. Cart Management Flow**

```
Add to Cart → Cart Service → Local Storage → Context Update → UI Notification
```

---

## Service Layer Architecture

### **Service Pattern**
Each business domain has its own service class:

```typescript
// Example: Product Service
class ProductService {
  async getProducts(): Promise<Product[]> { /* ... */ }
  async searchProducts(query: string): Promise<Product[]> { /* ... */ }
  async getProductById(id: number): Promise<Product | null> { /* ... */ }
}

export const productService = new ProductService();
```

### **Mock Data Strategy**
- **Development**: Uses static mock data from `src/data/`
- **Future**: Services designed for easy API integration
- **Type Safety**: All mock data implements TypeScript interfaces

---

## Features & Functionality

### **Core E-Commerce Features**
- **Product Catalog**: Category browsing, filtering, search
- **Shopping Cart**: Add/remove items, quantity management
- **User Authentication**: Login/logout, profile management
- **Checkout Process**: Address, payment, order confirmation
- **Wishlist**: Save favorite products
- **Responsive Design**: Mobile and desktop optimized

### **Advanced Features**
- **AI Jewelry Try-On**: Upload photo and virtually try jewelry
- **Dynamic Routing**: SEO-friendly URLs for categories and products
- **Search & Filtering**: Advanced product discovery
- **Theme Switching**: Dark/light mode support
- **Animations**: Smooth transitions and micro-interactions

### **Developer Experience**
- **TypeScript**: Full type safety across the application
- **Component Library**: Reusable, accessible UI components
- **Hot Reload**: Fast development with Next.js
- **ESLint**: Code quality and consistency
- **File Organization**: Clear separation of concerns

---

## Performance Optimizations

### **Next.js Optimizations**
- **App Router**: Modern routing with improved performance
- **Server Components**: Reduced client-side JavaScript
- **Static Generation**: Pre-built pages for faster loading
- **Image Optimization**: Automatic WebP conversion and lazy loading

### **Bundle Optimization**
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based bundle splitting
- **Dynamic Imports**: Lazy loading for large components

### **UI Performance**
- **Virtual Scrolling**: Efficient list rendering (if needed)
- **Memoization**: React.memo for expensive components
- **Optimistic Updates**: Immediate UI feedback

---

## Future Enhancements

### **Technical Improvements**
- **API Integration**: Replace mock services with real backend
- **Database Integration**: Product catalog and user data
- **Payment Gateway**: Stripe/PayPal integration
- **Authentication**: OAuth, JWT tokens

### **Feature Additions**
- **Order Tracking**: Real-time order status
- **Reviews & Ratings**: User-generated content
- **Recommendations**: AI-powered product suggestions
- **Multi-language**: Internationalization support

### **DevOps & Deployment**
- **CI/CD Pipeline**: Automated testing and deployment
- **Error Monitoring**: Crash reporting and analytics
- **Performance Monitoring**: Core Web Vitals tracking
- **CDN Integration**: Global content delivery

---

## Getting Started

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### **Key Commands**
- **Development**: `http://localhost:3000`
- **Build Output**: `.next/` directory
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS with custom variables

### **Environment Configuration**
- **Environment Variables**: `.env.local`
- **TypeScript Paths**: `@/*` alias for `src/*`
- **Next.js Config**: Custom build settings

---

This architecture provides a solid foundation for a modern e-commerce application with room for growth and scalability.