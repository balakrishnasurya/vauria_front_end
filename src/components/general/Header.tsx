'use client'; 


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  MapPin,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';


const logoImagePath = '/logo.png';



import { CategoryNavItem } from '@/models/interfaces/categories.interface';

interface HeaderProps {
  onLoginClick: () => void;
  onSearchSubmit?: (query: string) => void;
  showCategories?: boolean;
  categories?: CategoryNavItem[];
  onCategoryClick?: (categorySlug: string) => void;
  cartItemCount?: number;
  wishlistItemCount?: number;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onWishlistClick?: () => void;
  onCartClick?: () => void;
  onImageGenerationClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({
  onLoginClick,
  onSearchSubmit,
  showCategories = true,
  categories = [],
  onCategoryClick,
  cartItemCount = 0,
  wishlistItemCount = 0,
  currentUser,
  onLogout,
  onProfileClick,
  onWishlistClick,
  onCartClick,
  onImageGenerationClick,
  onLogoClick
}: HeaderProps) {
  const [pincode, setPincode] = useState('500001');
  const [pincodeLocation, setPincodeLocation] = useState({ city: 'Hyderabad', state: 'Telangana' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [mobileOpenCategories, setMobileOpenCategories] = useState<Record<string, boolean>>({});

  const handlePincodeUpdate = () => {
    // Mock pincode validation - in real app, call the service
    const mockLocations: Record<string, { city: string; state: string }> = {
      '500001': { city: 'Hyderabad', state: 'Telangana' },
      '400001': { city: 'Mumbai', state: 'Maharashtra' },
      '110001': { city: 'Delhi', state: 'Delhi' },
      '560001': { city: 'Bangalore', state: 'Karnataka' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu' }
    };

    const location = mockLocations[pincode];
    if (location) {
      setPincodeLocation(location);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
      setMobileSearchExpanded(false);
      setSearchQuery('');
    }
  };

  const handleMobileSearchToggle = () => {
    setMobileSearchExpanded(!mobileSearchExpanded);
    if (mobileSearchExpanded) {
      setSearchQuery('');
    }
  };

  const toggleDesktopDropdown = (categorySlug: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };

  const toggleMobileCategory = (categorySlug: string) => {
    setMobileOpenCategories(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileOpenCategories({});
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside any dropdown container
      if (!target.closest('[data-dropdown-container]')) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (categorySlug: string) => {
    closeMobileMenu();
    if (onCategoryClick) {
      onCategoryClick(categorySlug);
    }
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <motion.button 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={onLogoClick}
        >
          <img src={logoImagePath} alt="Vauria - Crafted for Queens" className="h-12" />
        </motion.button>

        {/* Center Left: Delivery Location */}
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 font-sans hover:bg-accent/50 transition-colors">
                <MapPin className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Deliver to</div>
                  <div className="text-sm font-medium">{pincodeLocation.city} {pincode}</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-serif font-medium">Update Location</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="font-sans"
                  />
                  <Button 
                    onClick={handlePincodeUpdate}
                    className="bg-primary hover:bg-primary/90 font-sans"
                  >
                    Update
                  </Button>
                </div>
                {pincodeLocation.city && (
                  <p className="text-sm text-muted-foreground font-sans">
                    Delivering to {pincodeLocation.city}, {pincodeLocation.state}
                  </p>
                )}
              </motion.div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <motion.form 
            onSubmit={handleSearchSubmit}
            className="relative"
            animate={{ scale: isSearchFocused ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for rings, necklaces, earrings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-12 h-12 text-base bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 bg-primary hover:bg-primary/90 font-sans transition-colors"
            >
              Search
            </Button>
          </motion.form>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {/* Try On Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onImageGenerationClick}
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-sans"
            >
              <Sparkles className="h-4 w-4" />
              Try On
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={currentUser ? onProfileClick : onLoginClick} 
              className="h-10 w-10 hover:bg-accent/50 transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>
          </motion.div>
          
          {/* WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onWishlistClick}
              className="h-10 w-10 hover:bg-accent/50 transition-colors relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {wishlistItemCount}
                </Badge>
              )}
            </Button>
          </motion.div>
          */}
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartClick}
              className="h-10 w-10 hover:bg-accent/50 transition-colors relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {/* CART COUNT BADGE - COMMENTED OUT FOR LATER USE
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {cartItemCount}
                </Badge>
              )}
              */}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        {/* Top Row - Menu, Logo, Icons */}
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access categories, try-on features, and navigation options</SheetDescription>
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <button onClick={() => { onLogoClick?.(); closeMobileMenu(); }}>
                    <img src={logoImagePath} alt="Vauria" className="h-10" />
                  </button>
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {showCategories && (
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-medium text-sm text-muted-foreground mb-3">Categories</h3>
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.slug}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="space-y-1"
                      >
                        {category.children && category.children.length > 0 ? (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-between font-sans hover:bg-accent/50 transition-colors"
                              onClick={() => toggleMobileCategory(category.slug)}
                            >
                              {category.name}
                              <motion.div
                                animate={{ rotate: mobileOpenCategories[category.slug] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </motion.div>
                            </Button>
                            <AnimatePresence>
                              {mobileOpenCategories[category.slug] && (
                                <motion.div 
                                  className="ml-4 space-y-1 overflow-hidden"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {category.children.map((child) => (
                                    <Button
                                      key={child.slug}
                                      variant="ghost"
                                      className="w-full justify-start font-sans text-sm hover:bg-accent/50 transition-colors"
                                      onClick={() => handleCategoryClick(child.slug)}
                                    >
                                      {child.name}
                                    </Button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full justify-start font-sans hover:bg-accent/50 transition-colors"
                            onClick={() => handleCategoryClick(category.slug)}
                          >
                            {category.name}
                          </Button>
                        )}
                      </motion.div>
                    ))}

                  </div>
                )}
                
                {/* Mobile Try On Button */}
                <div className="p-4 border-t border-border">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      onClick={() => {
                        onImageGenerationClick?.();
                        closeMobileMenu();
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Try On Jewelry
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </SheetContent>
          </Sheet>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogoClick}
          >
            <img src={logoImagePath} alt="Vauria" className="h-8" />
          </motion.button>

          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleMobileSearchToggle}
                className="hover:bg-accent/50 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={currentUser ? onProfileClick : onLoginClick}
                className="hover:bg-accent/50 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* WISHLIST FUNCTIONALITY - COMMENTED OUT FOR LATER USE
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onWishlistClick}
                className="hover:bg-accent/50 transition-colors relative"
              >
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Button>
            </motion.div>
            */}
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onCartClick}
                className="hover:bg-accent/50 transition-colors relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {/* CART COUNT BADGE - COMMENTED OUT FOR LATER USE
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {cartItemCount}
                  </Badge>
                )}
                */}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: mobileSearchExpanded ? 'auto' : 0,
            opacity: mobileSearchExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden border-t border-border"
        >
          <div className="px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for rings, necklaces, earrings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 font-sans bg-input-background border-border focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus={mobileSearchExpanded}
                />
              </div>
              <Button 
                type="submit" 
                className="h-11 bg-primary hover:bg-primary/90 font-sans px-4 min-w-[80px]"
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMobileSearchToggle}
                className="h-11 w-11 hover:bg-accent/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Desktop Categories */}
      {showCategories && (
        <motion.div 
          className="hidden lg:block border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-8 px-6 py-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {category.children && category.children.length > 0 ? (
                  <div className="relative" data-dropdown-container>
                    <Button
                      variant="ghost"
                      className="font-sans hover:text-primary hover:bg-accent/50 transition-colors gap-1"
                      onClick={() => toggleDesktopDropdown(category.slug)}
                    >
                      {category.name}
                      <motion.div
                        animate={{ rotate: openDropdowns[category.slug] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </Button>
                    <AnimatePresence>
                      {openDropdowns[category.slug] && (
                        <motion.div
                          className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2 space-y-1">
                            {category.children.map((child) => (
                              <Button
                                key={child.slug}
                                variant="ghost"
                                className="w-full justify-start font-sans hover:bg-accent/50 transition-colors"
                                onClick={() => {
                                  handleCategoryClick(child.slug);
                                  setOpenDropdowns(prev => ({ ...prev, [category.slug]: false }));
                                }}
                              >
                                {child.name}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="font-sans hover:text-primary hover:bg-accent/50 transition-colors"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    {category.name}
                  </Button>
                )}
              </motion.div>
            ))}

          </div>
        </motion.div>
      )}


    </motion.header>
  );
}