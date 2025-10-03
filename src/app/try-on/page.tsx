"use client";


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Sparkles, 
  Download,
  Share2,
  ChevronLeft,
  Heart,
  ShoppingBag,
  Search,
  Wand2,
  ImageIcon,
  X,
  Plus,
  Loader2
} from 'lucide-react';

import { toast } from 'sonner';
import { type Product } from '@/models/interfaces/product.interface';
import { productService } from '@/services/product.service';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';
import { imageGenerationService, type ImageGenerationResponse } from '@/services/imageGeneration.service';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useMainContext } from '@/context/MainContext';

export default function ImageGenerationPage() {
  const { handleLogoClick } = useMainContext();
  
  // TODO: Remove this when try-on feature is ready
  const isComingSoon = true;
  
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'cart' | 'search'>('wishlist');
  
  // Product data
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load wishlist and cart items
      const [wishlistItems, cartItems] = await Promise.all([
        wishlistService.getWishlistItems(),
        cartService.getCartItems()
      ]);

      // Convert to products (assuming we have product IDs)
      const [wishlistProducts, cartProducts] = await Promise.all([
        Promise.all((wishlistItems.data || []).slice(0, 6).map(item => 
          productService.getProducts().then(products => 
            products.find(p => p.id === item.id)
          )
        )),
        Promise.all((cartItems.data || []).slice(0, 6).map(item => 
          productService.getProducts().then(products => 
            products.find(p => p.id === item.id)
          )
        ))
      ]);

      setWishlistProducts(wishlistProducts.filter(Boolean) as Product[]);
      setCartProducts(cartProducts.filter(Boolean) as Product[]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to featured products
      const products = await productService.getFeaturedProducts();
      setWishlistProducts(products.slice(0, 3));
      setCartProducts(products.slice(2, 5));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size should be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      setUserPhoto(file);
      const url = URL.createObjectURL(file);
      setUserPhotoUrl(url);
      toast.success('Photo uploaded successfully!');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await productService.searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      toast.error('Error searching products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    toast.success(`Selected: ${product.name}`);
  };

  const handleGenerate = async () => {
    if (!userPhoto || !selectedProduct) {
      toast.error('Please upload a photo and select a product first');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await imageGenerationService.generateImage({
        userImage: userPhoto,
        productId: selectedProduct.id,
        category: selectedProduct.category_id,
        style: 'realistic'
      });

      setGeneratedImage(result);
      toast.success('Image generated successfully!');
    } catch (error) {
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage?.imageUrl) {
      const link = document.createElement('a');
      link.href = generatedImage.imageUrl;
      link.download = `vauria-tryOn-${Date.now()}.jpg`;
      link.click();
      toast.success('Image downloaded!');
    }
  };

  const handleShare = async () => {
    if (generatedImage?.imageUrl) {
      try {
        await navigator.clipboard.writeText(generatedImage.imageUrl);
        toast.success('Image link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderProductGrid = (products: Product[], emptyMessage: string) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.length > 0 ? (
        products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer ${
              selectedProduct?.id === product.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src={product.image_url || undefined}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <h4 className="font-serif text-sm font-medium line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="font-sans text-sm font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                {selectedProduct?.id === product.id && (
                  <Badge className="mt-2 bg-primary text-primary-foreground">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-sans text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Main content with overlay positioned relative to it */}
      <div className="relative">
        {/* TODO: Remove this Coming Soon overlay when feature is ready */}
        {isComingSoon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md mx-4 text-center"
            >
              <div className="mb-6">
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">
                  Our AI-powered jewelry try-on feature is currently in development. 
                  Check back soon for an amazing virtual try-on experience!
                </p>
              </div>
              <Button 
                onClick={handleLogoClick}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
          </div>
        )}
        
        {/* Main content with blur effect when overlay is active */}
        <div className={isComingSoon ? "blur-sm pointer-events-none" : ""}>
          <main className="pt-6 pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 mb-8">
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleLogoClick}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              AI Jewelry Try-On
            </h1>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your photo and see how you'll look wearing our exquisite jewelry pieces. 
              Experience the perfect fit before you buy.
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Upload & Selection */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Photo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Your Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!userPhotoUrl ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-sans text-muted-foreground mb-4">
                        Upload a clear photo of yourself for the best results
                      </p>
                      <label>
                        <Button variant="outline" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Photo
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={userPhotoUrl}
                          alt="Your photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setUserPhoto(null);
                          setUserPhotoUrl('');
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Use a clear, well-lit photo facing the camera</p>
                    <p>• Maximum file size: 10MB</p>
                    <p>• Supported formats: JPG, PNG, WebP</p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Select Jewelry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="wishlist" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </TabsTrigger>
                      <TabsTrigger value="cart" className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Cart
                      </TabsTrigger>
                      <TabsTrigger value="search" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="wishlist" className="mt-6">
                      {renderProductGrid(wishlistProducts, "No items in wishlist")}
                    </TabsContent>

                    <TabsContent value="cart" className="mt-6">
                      {renderProductGrid(cartProducts, "No items in cart")}
                    </TabsContent>

                    <TabsContent value="search" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for jewelry..."
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              handleSearch(e.target.value);
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleSearch(searchQuery)}
                            variant="outline"
                            size="icon"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderProductGrid(searchResults, "Search for jewelry to see results")}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Generation & Results */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Generation Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Generate Try-On
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProduct && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-serif font-medium mb-2">Selected Item:</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={selectedProduct.image_url}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-sans text-sm font-medium line-clamp-1">
                            {selectedProduct.name}
                          </p>
                          <p className="font-sans text-sm text-primary font-bold">
                            {formatPrice(selectedProduct.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={!userPhoto || !selectedProduct || isGenerating}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Try-On Image'}
                  </Button>

                  {!userPhoto && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please upload your photo first
                    </p>
                  )}
                  {!selectedProduct && userPhoto && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please select a jewelry piece
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Generated Result */}
              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Your Try-On Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={generatedImage.imageUrl}
                            alt="Generated try-on result"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            className="flex-1"
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>

                        {selectedProduct && (
                          <div className="pt-4 border-t border-border">
                            <p className="font-sans text-sm text-muted-foreground mb-3">
                              Love how it looks? Add it to your collection:
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  // Add to cart logic
                                  toast.success('Added to cart!');
                                }}
                                className="flex-1 bg-primary hover:bg-primary/90"
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Add to Cart
                              </Button>
                              <Button
                                onClick={() => {
                                  // Add to wishlist logic
                                  toast.success('Added to wishlist!');
                                }}
                                variant="outline"
                                size="icon"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      Use a high-resolution, well-lit photo
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      Face the camera directly for accurate placement
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      Ensure your neck/ears are clearly visible for jewelry placement
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      Try different jewelry pieces to find your perfect match
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
  );
}