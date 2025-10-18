'use client';

import { useState, useEffect } from 'react';
// Correct import for motion/AnimatePresence in Framer Motion
import { motion, AnimatePresence } from 'framer-motion'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// Removed unused Badge import
import { 
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Adjusted imports to match your new Next.js structure paths (using @/)
import { homeService } from '@/services/home.service';
import { productService } from '@/services/product.service';
import { mockBanners } from '@/data/products.data';
import { getHomepageCategories } from '@/data/categories.data';
import { ProductCard } from '@/components/general/ProductCard'; // Assuming ProductCard is here
import { CategoryCard } from '@/components/general/CategoryCard'; // Assuming CategoryCard is here
import { Product } from '@/models/interfaces/product.interface';
import { Category } from '@/models/interfaces/categories.interface';
import { LoginPageInline } from '@/components/general/LoginPageInline';
import { useMainContext } from '@/context/MainContext'; 


export default function HomePage( ) {

  // 🔥 Use the context hook to get state and handlers
  const { 
    showLoginInline, 
    handleProductClick, 
    handleCategoryClick, 
    handleImageGenerationClick,
    handleLogin,
    handleCloseLogin,
  } = useMainContext();


  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners] = useState(mockBanners);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load popular products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch first 8 products from API
        const response = await productService.getProductsFromApi({ per_page: 8 });
        setPopularProducts(response.items);
        
        const homeCategories = getHomepageCategories();
        setHomepageCategories(homeCategories);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-scroll banners with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Handle banner button click
  const handleBannerClick = (ctaLink: string) => {
    // Extract category slug from link (remove leading slash)
    const categorySlug = ctaLink.startsWith('/') ? ctaLink.slice(1) : ctaLink;
    handleCategoryClick(categorySlug);
  };

  // Removed redundant formatPrice and local handleCategoryClick

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="font-serif text-lg text-foreground">Loading Vauria...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main Content */}
      <main>
        {/* 🔥 Hero Banners (Top Image Slider) - RE-INTEGRATED */}
        <section className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={banners[currentBanner].image}
                alt={banners[currentBanner].title}
                className="w-full h-full object-cover"
              />
              {/* Conditionally render overlay based on showOverlay property */}
              {banners[currentBanner].showOverlay !== false && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
                      {banners[currentBanner].title}
                    </h1>
                    <p className="font-sans text-lg md:text-xl lg:text-2xl mb-6">
                      {banners[currentBanner].subtitle}
                    </p>
                    {banners[currentBanner].ctaText && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={() => handleBannerClick(banners[currentBanner].ctaLink)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-lg px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          {banners[currentBanner].ctaText}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Banner Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBanner ? 'bg-primary scale-125' : 'bg-white/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Banner Arrow Navigation */}
          <motion.button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
          <motion.button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        </section>

        {/* Categories Grid (Unchanged, uses handleCategoryClick from context) */}
        <motion.section 
          className="py-12 lg:py-16 px-4 lg:px-6"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="font-serif text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Shop by Category
            </motion.h2>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {homepageCategories.map((category, index) => (
                  <CategoryCard
                    key={category.slug}
                    category={category}
                    onClick={handleCategoryClick} 
                    index={index}
                    className="h-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Popular Products (Unchanged, uses handleProductClick from context) */}
        <motion.section 
          className="py-12 lg:py-16 px-4 lg:px-6 bg-muted/30"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8 lg:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-4">
                Popular Products
              </h2>
              <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
                Discover our most beloved pieces, crafted with precision and loved by queens worldwide
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {popularProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onClick={handleProductClick}
                  variant="featured"
                  showActions={true}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* 🔥 AI Try-On Feature - COMMENTED OUT FOR LATER USE
        <motion.section 
          className="py-12 lg:py-16 px-4 lg:px-6 bg-muted/20"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8 lg:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-4">
                Try On Before You Buy
              </h2>
              <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
                Experience our revolutionary AI-powered try-on feature. Upload your photo and see how you'll look wearing our exquisite jewelry pieces.
              </p>
            </motion.div>
            
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-serif text-xl lg:text-2xl font-bold">
                          See Yourself in Vauria
                        </h3>
                        <p className="font-sans text-muted-foreground">
                          Our AI technology creates realistic images of you wearing any piece from our collection. 
                          Perfect for finding your ideal jewelry before making a purchase.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-sans text-sm">Upload your photo securely</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-sans text-sm">Choose from wishlist, cart, or search</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-sans text-sm">Get realistic try-on results instantly</span>
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleImageGenerationClick}
                          className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-lg px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Try On Jewelry
                        </Button>
                      </motion.div>
                    </div>
                    
                    <div className="relative">
                      <motion.div
                        className="aspect-square bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="h-24 w-24 text-primary/40" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full"
                        animate={{ 
                          y: [0, -10, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent/30 rounded-full"
                        animate={{ 
                          y: [0, -8, 0],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 2.5,
                          repeat: Infinity,
                          delay: 1
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
        */}

        {/* CTA Section (Commented out as requested)
        <motion.section 
          className="py-16 lg:py-20 px-4 lg:px-6 bg-gradient-to-r from-primary/10 to-accent/10"
          variants={itemVariants}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
                Join the Royal Experience
              </h2>
              <p className="font-sans text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Become part of the Vauria family and enjoy exclusive access to limited collections, 
                personalized recommendations, and royal treatment.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-lg px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        */}
      </main>

      {/* CONDITIONAL RENDERING Inline Login Modal LoginPageInline  (Using context state/handlers) */}
      <AnimatePresence>
        {showLoginInline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseLogin} 
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <LoginPageInline 
                onLogin={handleLogin} 
                onClose={handleCloseLogin} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

