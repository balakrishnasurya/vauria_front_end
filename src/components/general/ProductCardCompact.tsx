import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Product } from '@/models/interfaces/product.interface';

// Utility function to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

interface ProductCardCompactProps {
  product: Product;
  index?: number;
  onClick?: (productSlug: string) => void;
  variant?: 'similar' | 'recent';
  className?: string;
}

export function ProductCardCompact({
  product,
  index = 0,
  onClick,
  variant = 'similar',
  className = ''
}: ProductCardCompactProps) {
  const handleCardClick = () => {
    onClick?.(product.slug);
  };

  // Animation props based on variant
  const getAnimationProps = () => {
    if (variant === 'similar') {
      return {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: {
          duration: 0.6,
          delay: index * 0.1,
        },
        whileHover: { y: -5 }
      };
    } else {
      return {
        initial: { opacity: 0, scale: 0.9 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true },
        transition: {
          duration: 0.4,
          delay: index * 0.05,
        },
        whileHover: { scale: 1.05 }
      };
    }
  };

  // Card styling based on variant
  const getCardStyling = () => {
    if (variant === 'similar') {
      return "overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300";
    } else {
      return "overflow-hidden border-border bg-card hover:shadow-md transition-all duration-300";
    }
  };

  return (
    <motion.div
      {...getAnimationProps()}
      onClick={handleCardClick}
      className={`group cursor-pointer ${className}`}
    >
      <Card className={getCardStyling()}>
        <div className="aspect-square overflow-hidden">
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className={variant === 'recent' ? 'p-3' : 'p-4'}>
          <h3 className={`font-serif font-medium text-foreground group-hover:text-primary transition-colors ${
            variant === 'recent' 
              ? 'text-sm mb-1 line-clamp-1' 
              : 'mb-2 line-clamp-2'
          }`}>
            {product.name}
          </h3>
          
          {/* Pricing */}
          <div className={`flex items-center gap-2 ${variant === 'recent' ? 'flex-wrap' : ''}`}>
            {product.offer_price ? (
              <>
                <span className={`font-serif font-bold text-foreground ${
                  variant === 'recent' ? 'text-sm' : ''
                }`}>
                  {formatPrice(product.offer_price)}
                </span>
                <span className={`font-sans text-muted-foreground line-through ${
                  variant === 'recent' ? 'text-xs' : 'text-sm'
                }`}>
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className={`font-serif font-bold text-foreground ${
                variant === 'recent' ? 'text-sm' : ''
              }`}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock Status for Similar Products */}
          {variant === 'similar' && product.stock === 0 && (
            <div className="text-xs font-sans text-destructive font-medium mt-1">
              Out of Stock
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}