'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { 
  ShoppingCart,
  Minus,
  Plus,
  X,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { cartService, type CartSummary } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { useMainContext } from '@/context/MainContext';
import { PRODUCT_MESSAGES } from '@/constants/product.messages';
import { toast } from 'sonner';

export default function CartPage() {
  const { handleLogoClick: onBackToHome, handleCheckoutClick: onCheckoutClick } = useMainContext();
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);

  const handleSearchSubmit = (query: string) => {
    console.log('Search:', query);
  };

  const handleCategoryClick = (categorySlug: string) => {
    console.log('Category clicked:', categorySlug);
  };

  // Load cart data on mount
  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      const response = await cartService.getCartSummary();
      if (response.success) {
        setCartSummary(response.data);
      }
      setLoading(false);
    };

    loadCartData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    try {
      const response = await cartService.updateQuantity(productId, newQuantity);
      if (response.success) {
        toast.success('Quantity updated successfully');
        // Reload cart summary
        const summaryResponse = await cartService.getCartSummary();
        if (summaryResponse.success) {
          setCartSummary(summaryResponse.data);
        }
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
        toast.success(response.message || 'Item removed from cart successfully');
        // Reload cart summary
        const summaryResponse = await cartService.getCartSummary();
        if (summaryResponse.success) {
          setCartSummary(summaryResponse.data);
        }
      } else {
        toast.error(response.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      toast.error('Failed to remove item from cart');
    }
  };

  /* MOVE TO WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
  const moveToWishlist = async (productId: string) => {
    const response = await cartService.moveToWishlist(productId);
    if (response.success) {
      // Also add to wishlist service
      await wishlistService.addToWishlist(productId);
      // Reload cart summary
      const summaryResponse = await cartService.getCartSummary();
      if (summaryResponse.success) {
        setCartSummary(summaryResponse.data);
      }
    }
  };
  */

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
          <h1 className="font-serif text-2xl lg:text-3xl font-bold mb-2">
            Shopping Cart
          </h1>
          <p className="font-sans text-muted-foreground">
            {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {/* Cart Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-20 h-20 bg-muted-foreground/20 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                      <div className="h-8 bg-muted-foreground/20 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="animate-pulse bg-muted rounded-lg p-6 h-80"></div>
            </div>
          </div>
        ) : cartSummary.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="font-sans text-muted-foreground mb-6">
              Add some beautiful jewelry to your cart
            </p>
            <Button
              onClick={onBackToHome}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
            >
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartSummary.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                            <img
                              src={item.image_url || (item.images && item.images[0]) || 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/CHAINS.JPG'}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif font-medium text-foreground">
                                {item.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(String(item.id))}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              {/* Price */}
                              <div className="flex items-center gap-2">
                                {item.offer_price ? (
                                  <>
                                    <span className="font-serif font-bold text-foreground">
                                      {formatPrice(item.offer_price)}
                                    </span>
                                    <span className="text-sm font-sans text-muted-foreground line-through">
                                      {formatPrice(item.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-serif font-bold text-foreground">
                                    {formatPrice(item.price)}
                                  </span>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-border rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(String(item.id), item.quantity - 1)}
                                    className="h-8 w-8 rounded-r-none"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="px-3 py-2 min-w-[3rem] text-center font-sans">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(String(item.id), item.quantity + 1)}
                                    className="h-8 w-8 rounded-l-none"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* MOVE TO WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                                <Button
                                  variant="ghost"
                                  onClick={() => moveToWishlist(String(item.id))}
                                  className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                  <Heart className="h-4 w-4" />
                                  <span className="hidden sm:inline">Move to Wishlist</span>
                                </Button>
                                */}
                              </div>
                            </div>

                            {/* Subtotal for this item */}
                            <div className="mt-2 text-right sm:text-left">
                              <span className="font-sans text-sm text-muted-foreground">
                                Subtotal: {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between font-sans">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {cartSummary.shipping === 0 ? 'Free' : formatPrice(cartSummary.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-muted-foreground">Tax (GST)</span>
                      <span className="text-foreground">{formatPrice(cartSummary.tax)}</span>
                    </div>
                    {cartSummary.shipping === 0 && (
                      <p className="text-sm font-sans text-primary">
                        🎉 You've qualified for free shipping!
                      </p>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-serif font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(cartSummary.total)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={onCheckoutClick}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-lg py-3 h-12"
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={onBackToHome}
                      className="font-sans text-muted-foreground hover:text-foreground"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>


    </div>
  );
}