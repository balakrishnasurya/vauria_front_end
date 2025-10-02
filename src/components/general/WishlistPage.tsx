import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { 
  Heart,
  ShoppingCart,
  Star,
  X,
  ArrowLeft
} from 'lucide-react';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';
import { type Product } from '@/models/interfaces/product.interface';

interface WishlistPageProps {
  onBackToHome: () => void;
}

export function WishlistPage({ 
  onBackToHome
}: WishlistPageProps) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);



  const handleCategoryClick = (categorySlug: string) => {
    console.log('Category clicked:', categorySlug);
  };

  // Load wishlist items on mount
  useEffect(() => {
    const loadWishlistItems = async () => {
      setLoading(true);
      try {
        const response = await wishlistService.getWishlistItems();
        if (response.success && Array.isArray(response.data)) {
          setWishlistItems(response.data);
        } else {
          console.error('Error loading data: Invalid response format', response);
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setWishlistItems([]);
      }
      setLoading(false);
    };

    loadWishlistItems();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const removeFromWishlist = async (productId: string) => {
    const response = await wishlistService.removeFromWishlist(productId);
    if (response.success) {
      setWishlistItems(items => items.filter(item => item.id !== productId));
    }
  };

  const addToCart = async (productId: string) => {
    const response = await cartService.addToCart(productId);
    if (response.success) {
      console.log('Item added to cart successfully');
    }
  };

  const moveAllToCart = async () => {
    const response = await wishlistService.moveAllToCart();
    if (response.success) {
      setWishlistItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-2">
                My Wishlist
              </h1>
              <p className="font-sans text-muted-foreground">
                {Array.isArray(wishlistItems) ? wishlistItems.length : 0} {Array.isArray(wishlistItems) && wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            {Array.isArray(wishlistItems) && wishlistItems.length > 0 && (
              <Button
                onClick={moveAllToCart}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Move All to Cart
              </Button>
            )}
          </div>
        </motion.div>

        {/* Wishlist Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="w-24 space-y-2">
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : !Array.isArray(wishlistItems) || wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="font-sans text-muted-foreground mb-6">
              Save items you love to your wishlist
            </p>
            <Button
              onClick={onBackToHome}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
            >
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(wishlistItems) && wishlistItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-border hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-medium text-foreground mb-1 text-lg">
                          {product.name}
                        </h3>
                        

                        
                        <div className="flex items-center gap-2 mb-3">
                          {product.offer_price ? (
                            <>
                              <span className="font-serif font-bold text-foreground text-lg">
                                {formatPrice(product.offer_price)}
                              </span>
                              <span className="text-sm font-sans text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-serif font-bold text-foreground text-lg">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-sans text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 justify-center">
                        <Button
                          onClick={() => addToCart(product.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans whitespace-nowrap"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Add to Cart</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => removeFromWishlist(product.id)}
                          className="border-border text-foreground hover:bg-muted font-sans whitespace-nowrap"
                        >
                          <X className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                          <span className="sm:hidden">Del</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>


    </div>
  );
}