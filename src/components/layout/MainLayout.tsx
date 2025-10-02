// src/components/layout/MainLayout.tsx
'use client'; 
import { Header } from '@/components/general/Header';
import { Footer } from '@/components/general/Footer';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
// Ensure the path is correct
import { MainContextProvider, useMainContext } from '@/context/MainContext'; 

// Wrapper component to consume the context and render Header/Footer
function ContentWrapper({ children }: { children: React.ReactNode }) {
    // 🔥 Get all necessary state and handlers from context, eliminating prop drilling
    const { 
        currentRouteIsDashboard, 
        categoryNavItems,
        cartItemCount,
        wishlistItemCount,
        currentUser,
        handleLogoClick,
        handleLoginClick,
        handleSearchSubmit,
        handleCategoryClick,
        handleLogout,
        handleProfileClick,
        handleWishlistClick,
        handleCartClick,
        handleImageGenerationClick,
        handleAboutClick
    } = useMainContext();
    
    // Note: The Header and Footer are conditional based on the route, managed by currentRouteIsDashboard
    return (
        <div className="min-h-screen bg-background">
            {/* Shared Header - only show for non-dashboard views */}
            {!currentRouteIsDashboard && (
                <Header
                    onLoginClick={handleLoginClick}
                    onSearchSubmit={handleSearchSubmit}
                    showCategories={true}
                    categories={categoryNavItems}
                    onCategoryClick={handleCategoryClick}
                    cartItemCount={cartItemCount}
                    wishlistItemCount={wishlistItemCount}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onProfileClick={handleProfileClick}
                    onWishlistClick={handleWishlistClick}
                    onCartClick={handleCartClick}
                    onImageGenerationClick={handleImageGenerationClick}
                    onLogoClick={handleLogoClick}
                />
            )}

            <main className={currentRouteIsDashboard ? 'h-screen' : ''}>
                {children}
            </main>

            {/* Shared Footer - only show for non-dashboard views */}
            {!currentRouteIsDashboard && (
                <Footer onAboutClick={handleAboutClick} />
            )}
        </div>
    );
}


// MainLayout exports the provider wrapper
export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <MainContextProvider>
                <ContentWrapper>
                    {children}
                </ContentWrapper>
                <Toaster />
            </MainContextProvider>
        </ThemeProvider>
    );
}