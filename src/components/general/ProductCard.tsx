import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Product } from '@/models/interfaces/product.interface';

// Utility function to format price (same as in other components)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (productSlug: string) => void;
  onWishlistClick?: (productId: string) => void;
  onAddToCartClick?: (productId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProductCard({
  product,
  index = 0,
  onClick,
  onWishlistClick,
  onAddToCartClick,
  showActions = true,
  variant = 'default',
  className = ''
}: ProductCardProps) {
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      onWishlistClick?.(product.id.toString());
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      onAddToCartClick?.(product.id.toString());
    }
  };

  const handleCardClick = () => {
    onClick?.(product.slug);
  };

  // Animation variants based on card type
  const getAnimationProps = () => {
    switch (variant) {
      case 'featured':
        return {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5, delay: index * 0.1 },
          whileHover: { 
            y: -5,
            transition: { duration: 0.2 }
          }
        };
      case 'compact':
        return {
          initial: { opacity: 0, scale: 0.9 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true },
          transition: { duration: 0.4, delay: index * 0.05 },
          whileHover: { scale: 1.02 }
        };
      default:
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: index * 0.05 }
        };
    }
  };

  // Card styling based on variant
  const getCardStyling = () => {
    switch (variant) {
      case 'featured':
        return "group cursor-pointer border-border hover:shadow-xl transition-all duration-300 overflow-hidden";
      case 'compact':
        return "group cursor-pointer border-border hover:shadow-lg transition-all duration-300 overflow-hidden";
      default:
        return "group cursor-pointer border-border hover:shadow-md transition-all duration-200 overflow-hidden";
    }
  };

  // Image hover animation based on variant
  const getImageAnimation = () => {
    if (variant === 'featured') {
      return {
        whileHover: { scale: 1.1 },
        transition: { duration: 0.3 }
      };
    }
    return {};
  };

  return (
    <motion.div
      {...getAnimationProps()}
      onClick={handleCardClick}
      className={`cursor-pointer ${className}`}
    >
      <Card className={getCardStyling()}>
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            {variant === 'featured' ? (
              <motion.img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                {...getImageAnimation()}
              />
            ) : (
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Out of Stock Overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="bg-destructive text-destructive-foreground px-3 py-2 rounded-lg font-serif font-bold text-sm">
                  Out of Stock
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {showActions && (
              <motion.div 
                className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleWishlistClick}
                    disabled={product.stock === 0}
                    className={`bg-white/90 hover:bg-white text-foreground hover:text-primary h-8 w-8 shadow-sm transition-colors duration-200 ${
                      product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </motion.div>
                */}
                {/* CART FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleAddToCartClick}
                    disabled={product.stock === 0}
                    className={`bg-white/90 hover:bg-white text-foreground hover:text-primary h-8 w-8 shadow-sm transition-colors duration-200 ${
                      product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </motion.div>
                */}
              </motion.div>
            )}
          </div>
          
          {/* Product Information */}
          <motion.div 
            className={variant === 'compact' ? 'p-3' : 'p-4'}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className={`font-serif font-medium text-foreground group-hover:text-primary transition-colors ${
              variant === 'compact' ? 'mb-2 text-sm line-clamp-1' : 'mb-2'
            }`}>
              {product.name}
            </h3>
            
            {/* Pricing */}
            <div className="flex items-center gap-2">
              {product.offer_price ? (
                <>
                  <motion.span 
                    className={`font-serif font-bold text-foreground ${
                      variant === 'compact' ? 'text-sm' : ''
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    {formatPrice(product.offer_price)}
                  </motion.span>
                  <motion.span 
                    className={`font-sans text-muted-foreground line-through ${
                      variant === 'compact' ? 'text-xs' : 'text-sm'
                    }`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    {formatPrice(product.price)}
                  </motion.span>
                </>
              ) : (
                <motion.span 
                  className={`font-serif font-bold text-foreground ${
                    variant === 'compact' ? 'text-sm' : ''
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  {formatPrice(product.price)}
                </motion.span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock === 0 && (
              <div className="text-xs font-sans text-destructive font-medium mt-1">
                Out of Stock
              </div>
            )}
            {/* LOW STOCK WARNING - COMMENTED OUT FOR LATER USE
            {product.stock > 0 && product.stock <= 5 && (
              <div className="text-xs font-sans text-orange-500 font-medium mt-1">
                Only {product.stock} left
              </div>
            )}
            */}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}