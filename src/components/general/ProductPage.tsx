import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Share2,
  Star,
  ShoppingBag,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";

import { Product } from "@/models/interfaces/product.interface";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { PRODUCT_MESSAGES } from "@/constants/product.messages";
import { toast } from "sonner";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { ProductCardCompact } from "./ProductCardCompact";

interface ProductPageProps {
  productSlug: string;
  onBackToHome: () => void;
  onProductClick?: (productSlug: string) => void;
}

export function ProductPage({
  productSlug,
  onBackToHome,
  onProductClick,
}: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<
    Product[]
  >([]);
  const [recentlyViewed, setRecentlyViewed] = useState<
    Product[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productData =
          await productService.getProductBySlug(productSlug);
        if (!productData) {
          setError(PRODUCT_MESSAGES.NOT_FOUND);
          return;
        }

        setProduct(productData);

        // Load similar products and recently viewed
        const [similar, recent] = await Promise.all([
          productService.getSimilarProducts(
            productData.id,
            productData.category_id,
          ),
          productService.getRecentlyViewedProducts(),
        ]);

        setSimilarProducts(similar);
        setRecentlyViewed(recent);
      } catch (err) {
        setError(PRODUCT_MESSAGES.ERROR);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      loadProduct();
    }
  }, [productSlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (product && product.stock > 0) {
      try {
        const response = await cartService.addToCart(
          product.id,
          quantity,
        );
        if (response.success) {
          toast.success(PRODUCT_MESSAGES.ADDED_TO_CART);
        } else {
          toast.error(
            response.message || "Failed to add item to cart",
          );
        }
      } catch (error) {
        toast.error("Failed to add item to cart");
      }
    } else if (product && product.stock === 0) {
      toast.error("This item is currently out of stock");
    }
  };

  const handleBuyNow = () => {
    if (product) {
      handleAddToCart();
      // Navigate to checkout
    }
  };

  const handleWishlistToggle = () => {
    if (product && product.stock > 0) {
      if (isInWishlist) {
        setIsInWishlist(false);
        toast.success(PRODUCT_MESSAGES.REMOVED_FROM_WISHLIST);
      } else {
        setIsInWishlist(true);
        toast.success(PRODUCT_MESSAGES.ADDED_TO_WISHLIST);
      }
    } else if (product && product.stock === 0) {
      toast.error("Cannot add out-of-stock items to wishlist");
    }
  };

  const handleShare = async () => {
    if (product) {
      try {
        const url = `${window.location.origin}${window.location.pathname}`;
        await navigator.clipboard.writeText(url);
        toast.success(PRODUCT_MESSAGES.SHARED);
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1,
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-6">
          {/* Breadcrumb Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-6 mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <span>/</span>
              <Skeleton className="h-4 w-20" />
              <span>/</span>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Product Loading Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
              {/* Image Skeleton */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="w-20 h-20 rounded-lg"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Product Info Skeleton */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4" />
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-4 w-4 rounded-full"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

                <Skeleton className="h-4 w-40" />

                <div className="space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-12" />
                    <Skeleton className="h-12 w-12" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="text-center space-y-2"
                    >
                      <Skeleton className="h-6 w-6 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Details Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, j) => (
                          <div
                            key={j}
                            className="flex justify-between"
                          >
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Similar Products Skeleton */}
            <motion.section
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="text-center mb-8">
                <Skeleton className="h-8 w-48 mx-auto" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.5 + i * 0.1,
                    }}
                  >
                    <Card className="overflow-hidden">
                      <Skeleton className="aspect-square w-full" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Skeleton
                              key={j}
                              className="h-3 w-3 rounded-full"
                            />
                          ))}
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-serif text-2xl">{error}</h2>
            <Button onClick={onBackToHome} variant="outline">
              Go Back Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-6">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 mb-6">
          <motion.div
            className="flex items-center gap-2 text-sm font-sans text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={onBackToHome}
              className="hover:text-primary transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="capitalize">
              {product.category_id}
            </span>
            <span>/</span>
            <span className="text-foreground">
              {product.name}
            </span>
          </motion.div>
        </div>

        {/* Product Details */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Product Images */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <ImageWithFallback
                      src={product.images?.[selectedImageIndex] || product.image_url || ''}
                      alt={`${product.name} - View ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-serif text-lg font-bold">
                      Out of Stock
                    </div>
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() =>
                        setSelectedImageIndex(index)
                      }
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Information */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Product Title */}
              <div className="space-y-3">
                <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {product.offer_price ? (
                    <>
                      <span className="font-serif text-3xl font-bold text-foreground">
                        {formatPrice(product.offer_price)}
                      </span>
                      <span className="font-sans text-xl text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-serif text-3xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                {product.offer_price && (
                  <div className="text-sm font-sans text-primary">
                    Save{" "}
                    {formatPrice(product.price - product.offer_price)}
                    {" "}
                    (
                    {Math.round(
                      ((product.price - product.offer_price) /
                        product.price) *
                        100,
                    )}
                    % off)
                  </div>
                )}
                
                {/* Stock Status */}
                {product.stock === 0 && (
                  <div className="text-sm font-sans text-destructive font-medium">
                    Out of Stock
                  </div>
                )}
                {/* LOW STOCK WARNING - COMMENTED OUT FOR LATER USE
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="text-sm font-sans text-orange-500 font-medium">
                    Only {product.stock} left in stock
                  </div>
                )}
                */}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-sans text-sm text-green-600">
                      {product.stock <= 5
                        ? PRODUCT_MESSAGES.LOW_STOCK.replace(
                            "{count}",
                            product.stock.toString(),
                          )
                        : PRODUCT_MESSAGES.IN_STOCK}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-sans text-sm text-red-600">
                      {PRODUCT_MESSAGES.OUT_OF_STOCK}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-medium">
                  Description
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-medium">
                  Key Features
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-sans text-sm text-muted-foreground">
                      Material
                    </span>
                    <p className="font-sans text-sm font-medium">
                      {product.material}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-sm text-muted-foreground">
                      Weight
                    </span>
                    <p className="font-sans text-sm font-medium">
                      {product.weight}g
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-sm text-muted-foreground">
                      Dimensions
                    </span>
                    <p className="font-sans text-sm font-medium">
                      {product.dimensions}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-sm text-muted-foreground">
                      Stock
                    </span>
                    <p className="font-sans text-sm font-medium">
                      {product.stock} pieces
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  {/* ADD TO CART FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans h-12 text-lg"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      {PRODUCT_MESSAGES.ADD_TO_CART}
                    </Button>
                  </motion.div>
                  */}

                  {/* WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleWishlistToggle}
                      disabled={product.stock === 0}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Heart
                        className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </motion.div>
                  */}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* BUY NOW FUNCTIONALITY - COMMENTED OUT FOR LATER USE
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans h-12 text-lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {PRODUCT_MESSAGES.BUY_NOW}
                  </Button>
                </motion.div>
                */}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center space-y-2">
                  <Shield className="h-6 w-6 mx-auto text-primary" />
                  <p className="font-sans text-xs text-muted-foreground">
                    Certified Authentic
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Truck className="h-6 w-6 mx-auto text-primary" />
                  <p className="font-sans text-xs text-muted-foreground">
                    Free Shipping
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <RefreshCw className="h-6 w-6 mx-auto text-primary" />
                  <p className="font-sans text-xs text-muted-foreground">
                    30-Day Returns
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-medium mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    {PRODUCT_MESSAGES.SPECIFICATIONS}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="font-sans text-sm text-muted-foreground">
                            {key}
                          </span>
                          <span className="font-sans text-sm font-medium text-right">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Care Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-medium mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {PRODUCT_MESSAGES.CARE_INSTRUCTIONS}
                  </h3>
                  <ul className="space-y-2">
                    {product.care_instructions.map(
                      (instruction, index) => (
                        <li
                          key={index}
                          className="font-sans text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          {instruction}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-medium mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="font-sans text-xs capitalize"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <motion.section
              className="mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-8 text-center">
                {PRODUCT_MESSAGES.SIMILAR_PRODUCTS}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct, index) => (
                  <ProductCardCompact
                    key={similarProduct.id}
                    product={similarProduct}
                    index={index}
                    onClick={onProductClick}
                    variant="similar"
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <motion.section
              className="mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-8 text-center">
                {PRODUCT_MESSAGES.RECENTLY_VIEWED}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {recentlyViewed
                  .slice(0, 6)
                  .map((recentProduct, index) => (
                    <ProductCardCompact
                      key={recentProduct.id}
                      product={recentProduct}
                      index={index}
                      onClick={onProductClick}
                      variant="recent"
                    />
                  ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}