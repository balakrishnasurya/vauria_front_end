'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Use next/navigation for client-side routing and path checking
import { useRouter, usePathname } from 'next/navigation'; 
// Import interfaces and services
import { authService } from '@/services/auth.service';
import { categoryService } from '@/services/category.service';
import { Category, CategoryNavItem } from '@/models/interfaces/categories.interface';

// --- Type Definitions ---
type CurrentUser = { name: string; email: string } | null;

interface MainContextProps {
    isAuthenticated: boolean;
    currentUser: CurrentUser;
    categoryNavItems: CategoryNavItem[];
    categories: Category[];
    cartItemCount: number;
    wishlistItemCount: number;
    showLoginInline: boolean;
    
    // Auth Handlers (Placed first for emphasis)
    handleLoginClick: () => void;
    handleLogout: () => Promise<void>;
    handleLogin: (email: string) => Promise<void>;
    handleCloseLogin: () => void;
    
    // Navigation Handlers
    handleLogoClick: () => void;
    handleCategoryClick: (categorySlug: string) => void;
    handleProductClick: (productSlug: string) => void;
    handleSearchSubmit: (query: string) => void;
    handleWishlistClick: () => void;
    handleCartClick: () => void;
    handleCheckoutClick: () => void;
    handleProfileClick: () => void;
    handleImageGenerationClick: () => void;
    handleAboutClick: () => void;
    
    // Utility for Layout
    currentRouteIsDashboard: boolean;
}

const MainContext = createContext<MainContextProps | undefined>(undefined);

// Helper function from old App.tsx (Unchanged)
const convertCategoriesToNavItems = (categories: Category[]): CategoryNavItem[] => {
    return categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        children: category.children?.map(child => ({
            id: child.id,
            name: child.name,
            slug: child.slug
        })),
        hasDropdown: !!(category.children && category.children.length > 0)
    }));
};


export function MainContextProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    
    // ------------------------------------
    // 1. STATE MANAGEMENT
    // ------------------------------------
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryNavItems, setCategoryNavItems] = useState<CategoryNavItem[]>([]);
    const [cartItemCount, setCartItemCount] = useState(2); 
    const [wishlistItemCount, setWishlistItemCount] = useState(6); 
    const [showLoginInline, setShowLoginInline] = useState(false);
    
    // Derived state
    const currentRouteIsDashboard = pathname.startsWith('/dashboard');

    // ------------------------------------
    // 2. AUTHENTICATION & SESSION LOGIC (TOP PRIORITY)
    // ------------------------------------

    // --- Side Effect: Initial Load (Auth Check & Categories Fetch) ---
    useEffect(() => {
        const checkAuthAndLoadCategories = async () => {
            // 1. Check Auth & Handle User Setup
            const user = await authService.getCurrentUser();
            if (user) {
                setCurrentUser({ 
                    name: `${user.firstName || 'Demo'} ${user.lastName || 'User'}`, 
                    email: user.email 
                });
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }

            // 2. Load Categories
            try {
                const categoryResponse = await categoryService.getCategories();
                if (categoryResponse.success) {
                    setCategories(categoryResponse.data);
                    setCategoryNavItems(convertCategoriesToNavItems(categoryResponse.data));
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };

        checkAuthAndLoadCategories();
        
        // Apply dark theme on mount
        document.documentElement.classList.add('dark');
    }, []);

    // --- Auth Handlers ---
    const handleLoginClick = useCallback(() => {
        if (pathname === '/') {
            setShowLoginInline(true); // Show modal on home page
        } else {
            router.push('/login'); // Navigate to full page login elsewhere
        }
    }, [pathname, router]);

    const handleCloseLogin = useCallback(() => {
        setShowLoginInline(false);
    }, []);
    
    const handleLogin = async (email: string) => {
        const user = await authService.getCurrentUser();
        if (user) {
            setCurrentUser({ 
                name: `${user.firstName || 'Demo'} ${user.lastName || 'User'}`, 
                email: user.email 
            });
            setIsAuthenticated(true);
            setShowLoginInline(false);

            // Check for redirect destination after login
            const redirectTo = typeof window !== 'undefined' 
                ? localStorage.getItem('vauria_redirect_after_login') 
                : null;
            
            if (redirectTo) {
                // Clear the stored redirect and message
                localStorage.removeItem('vauria_redirect_after_login');
                localStorage.removeItem('vauria_login_message');
                router.push(redirectTo);
            } else if (user.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/profile');
            }
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
        router.push('/');
        setShowLoginInline(false);
    };

    // ------------------------------------
    // 3. NAVIGATION HANDLERS
    // ------------------------------------

    const handleLogoClick = useCallback(() => {
        router.push('/');
        setShowLoginInline(false);
    }, [router]);

    const handleCategoryClick = useCallback((categorySlug: string) => {
        // Updated to use the new route format: baseurl/category-slug/
        // Note: The trailing slash is optional with Next.js, but using the slug directly is correct.
        router.push(`/${categorySlug}`);
        setShowLoginInline(false); // Add this for consistency
    }, [router]);

    const handleProductClick = useCallback((productSlug: string) => {
        router.push(`/products/${productSlug}`);
    }, [router]);

    const handleSearchSubmit = useCallback((query: string) => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
    }, [router]);
    
    const handleWishlistClick = useCallback(() => { router.push('/wishlist'); }, [router]);
    const handleCartClick = useCallback(() => { 
        if (!isAuthenticated) {
            // Store intended destination and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.setItem('vauria_redirect_after_login', '/cart');
                localStorage.setItem('vauria_login_message', 'Login to access your cart');
            }
            router.push('/login');
        } else {
            router.push('/cart');
        }
    }, [router, isAuthenticated]);
    const handleCheckoutClick = useCallback(() => { router.push('/checkout'); }, [router]);
    const handleProfileClick = useCallback(() => { router.push('/profile'); }, [router]);
    const handleImageGenerationClick = useCallback(() => { 
        if (!isAuthenticated) {
            // Store intended destination and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.setItem('vauria_redirect_after_login', '/try-on');
                localStorage.setItem('vauria_login_message', 'Login to use our try on feature');
            }
            router.push('/login');
        } else {
            router.push('/try-on');
        }
    }, [router, isAuthenticated]);
    const handleAboutClick = useCallback(() => { router.push('/about'); }, [router]);

    // ------------------------------------
    // 4. CONTEXT VALUE
    // ------------------------------------

    const value: MainContextProps = {
        isAuthenticated,
        currentUser,
        categoryNavItems,
        categories,
        cartItemCount,
        wishlistItemCount,
        showLoginInline,
        currentRouteIsDashboard,
        
        handleLoginClick,
        handleLogout,
        handleLogin,
        handleCloseLogin,

        handleLogoClick,
        handleCategoryClick,
        handleProductClick,
        handleSearchSubmit,
        handleWishlistClick,
        handleCartClick,
        handleCheckoutClick,
        handleProfileClick,
        handleImageGenerationClick,
        handleAboutClick,
    };

    return (
        <MainContext.Provider value={value}>
            {children}
        </MainContext.Provider>
    );
}

// Hook to use the context (Unchanged)
export const useMainContext = () => {
    const context = useContext(MainContext);
    if (context === undefined) {
        throw new Error('useMainContext must be used within a MainContextProvider');
    }
    return context;
};