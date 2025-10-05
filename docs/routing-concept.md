# Routing in this Project (Beginner Friendly)

This project uses Next.js 14 with the App Router. Routing is file-based: the folders and files under `src/app` define your URLs. Here's how it works in this repo, step by step, with concrete examples.

## Key ideas first

- File-based routing: the pathname mirrors the folder structure under `src/app`.
- `page.tsx` = a route. `layout.tsx` = a persistent wrapper (shell) for routes beneath it.
- Dynamic routes use bracket folders like `[categorySlug]`.
- Client navigation uses `next/navigation` hooks (e.g., `useRouter().push()`), not `next/router`.
- Server vs Client components: by default files are Server Components; add `'use client'` to opt-in to Client Components.
- Search params/hooks like `useSearchParams()` must be used in Client Components and wrapped with `<Suspense>` when used in pages.

---

## Folder map → Routes

Located in `src/app/`:

- `page.tsx` → `/` (Home)
- `layout.tsx` → Root layout that wraps all routes
- `cart/` → `/cart`
- `checkout/` → `/checkout`
- `login/` → `/login`
- `payment/` → `/payment`
- `profile/` → `/profile`
- `search/` → `/search`
- `try-on/` → `/try-on`
- `[categorySlug]/` → `/:categorySlug` (dynamic)
  - `[productSlug]/` inside it would map to `/:categorySlug/:productSlug` (if a `page.tsx` exists)

In this repo we also navigate to `/products/:productSlug` from code, which is a legacy pattern. The active dynamic product route lives under the category folder. See Navigation section for details.

---

## Global layout: `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
```

- This layout wraps every page. It imports global CSS and renders the shared UI from `components/layout/MainLayout` (header, footer, etc.).
- Anything you put here persists across route changes.

---

## Home route: `src/app/page.tsx` → `/`

- Marked `'use client'` because it uses state, effects, animations, and context hooks.
- Loads products and categories, renders hero + grids, and uses handlers from `MainContext` to navigate.

---

## Dynamic category route: `src/app/[categorySlug]/page.tsx` → `/:categorySlug`

- Because the folder is named `[categorySlug]`, the segment is dynamic.
- In the component, you receive `params: { categorySlug: string }`.
- The page uses `categorySlug` to load the category, build filters, and fetch products (via `categoryService` or `productService`).
- Helper `getCategoryIdFromSlug` maps human-friendly slugs to numeric IDs.

Example signature:
```ts
interface CategoryPageProps { params: { categorySlug: string } }
export default function CategoryPage({ params }: CategoryPageProps) { /* ... */ }
```

---

## Search route and search params: `src/app/search/page.tsx` → `/search`

- Uses `useSearchParams()` to read `?q=...` from the URL.
- App Router requires a Suspense boundary for pages using `useSearchParams()`.

Pattern used in this repo:
```tsx
export default function SearchPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  // ... render results
}
```

---

## Client navigation: `src/context/MainContext.tsx`

This centralizes navigation handlers with `useRouter()` from `next/navigation`:

```ts
const router = useRouter();

const handleCategoryClick = (categorySlug: string) => {
  router.push(`/${categorySlug}`); // matches [categorySlug]/page.tsx
};

const handleProductClick = (productSlug: string) => {
  router.push(`/products/${productSlug}`); // legacy path; see note below
};

const handleSearchSubmit = (query: string) => {
  router.push(`/search?q=${encodeURIComponent(query)}`);
};
```

Notes:
- Category navigation matches the dynamic route folder (`/:categorySlug`).
- Product navigation uses `/products/:slug`, but the current dynamic product page lives under `src/app/[categorySlug]/[productSlug]/`. If you want products under `/products/:slug`, create `src/app/products/[productSlug]/page.tsx` and move or proxy the code there.

---

## Client vs Server Components

- Files default to Server Components in App Router.
- Add `'use client'` at the top when you need state, effects, browser APIs, or client hooks like `useRouter()`.
- Examples in this repo using `'use client'`: Home, Search, Category pages, and many UI components.

---

## Data flow and services

Pages call services in `src/services/*` which resolve data from mock arrays or an API. Examples:
- `productService.getProductsFromApi({ category_id, per_page, page })`
- `categoryService.getCategoryProducts(slug, { page, per_page, sortBy, filters })`

This keeps routing/UI logic separate from data fetching.

---

## How dynamic params are used

- In `[categorySlug]/page.tsx`, `params.categorySlug` is used to:
  - Fetch category details
  - Build filters
  - Look up a numeric `category_id` to pass to the product API
- In a nested `[productSlug]` route (if implemented), you'd receive both params: `{ categorySlug, productSlug }`.

---

## Adding a new route (step-by-step)

1. Create a folder under `src/app` with your path name.
   - Example: `src/app/about/page.tsx` → `/about`
2. If you need shared UI for a subtree, add a `layout.tsx` next to it.
3. If the route needs client-side hooks or state, start the file with `'use client'`.
4. For dynamic segments, wrap in brackets, e.g., `src/app/blog/[slug]/page.tsx` → `/blog/:slug`.
5. For query string reading, use `useSearchParams()` inside a Client Component wrapped with `<Suspense>`.
6. Use `useRouter().push('/path')` for programmatic navigation.

---

## Current route table (from build output)

- `/` (Home)
- `/:categorySlug` (Category)
- `/:categorySlug/:productSlug` (Product under category)
- `/cart`
- `/checkout`
- `/login`
- `/payment`
- `/profile`
- `/search`
- `/try-on`

---

## Common pitfalls (and how this repo handles them)

- Using `useSearchParams()` in a page without Suspense → fixed by wrapping content in `<Suspense>`.
- Mixing number IDs with string params → services coerce IDs where needed.
- Navigating to routes that don't exist → ensure folder structure under `src/app` matches the intended URL.

---

## Header Navigation Architecture

The Header component demonstrates a sophisticated navigation pattern that separates UI concerns from routing logic through the Context API pattern.

### Navigation Flow Overview

```
Header Component → MainContext → useRouter() → Next.js Navigation
```

### 1. **Header as Presentation Layer**

The Header (`src/components/general/Header.tsx`) is a pure UI component that:
- Receives navigation handlers as props
- Does NOT import `useRouter()` directly
- Focuses only on UI interactions and animations

```tsx
interface HeaderProps {
  onLoginClick: () => void;
  onSearchSubmit?: (query: string) => void;
  onCategoryClick?: (categorySlug: string) => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onImageGenerationClick?: () => void;
  onLogoClick?: () => void;
  // ... other UI-specific props
}
```

### 2. **MainContext as Navigation Layer**

The MainContext (`src/context/MainContext.tsx`) centralizes all navigation logic:

```tsx
const router = useRouter();

// Centralized navigation handlers
const handleLogoClick = useCallback(() => {
  router.push('/');
}, [router]);

const handleCategoryClick = useCallback((categorySlug: string) => {
  router.push(`/${categorySlug}`);
}, [router]);

const handleProductClick = useCallback((productSlug: string) => {
  router.push(`/products/${productSlug}`);
}, [router]);

const handleSearchSubmit = useCallback((query: string) => {
  router.push(`/search?q=${encodeURIComponent(query)}`);
}, [router]);
```

### 3. **MainLayout as Bridge**

The MainLayout (`src/components/layout/MainLayout.tsx`) connects Header to MainContext:

```tsx
function ContentWrapper({ children }) {
  const { 
    handleLogoClick,
    handleLoginClick,
    handleCategoryClick,
    handleCartClick,
    // ... all navigation handlers
  } = useMainContext();
  
  return (
    <div>
      <Header
        onLoginClick={handleLoginClick}
        onCategoryClick={handleCategoryClick}
        onCartClick={handleCartClick}
        // ... pass all handlers as props
      />
      {children}
    </div>
  );
}
```

### 4. **Header Navigation Patterns**

#### **Logo Navigation**
```tsx
// Desktop & Mobile
<motion.button onClick={onLogoClick}>
  <img src={logoImagePath} alt="Vauria" />
</motion.button>
```

#### **Category Navigation**
- **Desktop**: Dropdown with hover animations
- **Mobile**: Collapsible accordion in side drawer

```tsx
// Category click handler (both desktop & mobile)
const handleCategoryClick = (categorySlug: string) => {
  closeMobileMenu(); // Close mobile menu if open
  if (onCategoryClick) {
    onCategoryClick(categorySlug); // → MainContext → router.push(`/${categorySlug}`)
  }
};
```

#### **Search Navigation**
```tsx
const handleSearchSubmit = (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (searchQuery.trim() && onSearchSubmit) {
    onSearchSubmit(searchQuery.trim()); // → MainContext → router.push(`/search?q=...`)
    setMobileSearchExpanded(false);
    setSearchQuery('');
  }
};
```

#### **Profile Dropdown Navigation**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <User className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {currentUser ? (
      <>
        <DropdownMenuItem onSelect={onProfileClick}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={onLogout}>Logout</DropdownMenuItem>
      </>
    ) : (
      <DropdownMenuItem onSelect={onLoginClick}>Login</DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

### 5. **Mobile Navigation Patterns**

#### **Mobile Menu (Sheet)**
- Uses Radix UI Sheet component
- Animated category accordion
- Centralized close handler

#### **Mobile Search**
- Expandable search bar
- Automatic focus management
- Clean state on close

### 6. **State Management in Header**

The Header manages its own UI state while delegating navigation:

```tsx
// UI-only state (Header manages)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

// Navigation state (MainContext manages)
// - currentUser (auth state)
// - cartItemCount (cart state)
// - categoryNavItems (menu structure)
```

### 7. **Benefits of this Architecture**

1. **Separation of Concerns**: UI logic separate from routing logic
2. **Reusability**: Header can be used anywhere with different navigation handlers
3. **Testability**: Easy to test UI without mocking routing
4. **Consistency**: All navigation logic centralized in one place
5. **Type Safety**: TypeScript interfaces ensure proper prop passing

### 8. **Adding New Navigation**

To add new navigation to the Header:

1. **Add handler to MainContext**:
```tsx
const handleNewFeatureClick = useCallback(() => {
  router.push('/new-feature');
}, [router]);
```

2. **Add to HeaderProps interface**:
```tsx
interface HeaderProps {
  // ... existing props
  onNewFeatureClick?: () => void;
}
```

3. **Pass from MainLayout**:
```tsx
<Header
  // ... existing props
  onNewFeatureClick={handleNewFeatureClick}
/>
```

4. **Use in Header component**:
```tsx
<Button onClick={onNewFeatureClick}>
  New Feature
</Button>
```

This pattern ensures all navigation remains centralized and consistent across the application.

---

If you want, I can also create a small diagram of the route tree or add code examples for adding a `/products/[productSlug]` route explicitly.


