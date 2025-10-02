// Message constants for Vauria Jewelry Website

export const AUTH_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    REGISTER: 'Account created successfully',
    PASSWORD_RESET: 'Password reset email sent',
    PROFILE_UPDATE: 'Profile updated successfully'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
    WEAK_PASSWORD: 'Password must be at least 8 characters',
    INVALID_EMAIL: 'Please enter a valid email address',
    LOGIN_FAILED: 'Login failed. Please try again',
    REGISTER_FAILED: 'Registration failed. Please try again',
    UNAUTHORIZED: 'You are not authorized to access this resource'
  }
} as const;

export const PRODUCT_MESSAGES = {
  SUCCESS: {
    FETCHED: 'Products fetched successfully',
    ADDED: 'Product added successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully'
  },
  ERROR: {
    NOT_FOUND: 'Product not found',
    FETCH_FAILED: 'Failed to fetch products',
    ADD_FAILED: 'Failed to add product',
    UPDATE_FAILED: 'Failed to update product',
    DELETE_FAILED: 'Failed to delete product',
    OUT_OF_STOCK: 'Product is out of stock'
  }
} as const;

export const CART_MESSAGES = {
  SUCCESS: {
    FETCHED: 'Cart fetched successfully',
    ITEM_ADDED: 'Item added to cart',
    ITEM_UPDATED: 'Cart updated successfully',
    ITEM_REMOVED: 'Item removed from cart',
    CLEARED: 'Cart cleared successfully',
    MOVED_TO_WISHLIST: 'Item moved to wishlist',
    COUPON_APPLIED: 'Coupon applied successfully',
    CHECKOUT_SUCCESS: 'Order placed successfully'
  },
  ERROR: {
    FETCH_FAILED: 'Failed to fetch cart',
    ADD_FAILED: 'Failed to add item to cart',
    UPDATE_FAILED: 'Failed to update quantity',
    REMOVE_FAILED: 'Failed to remove item from cart',
    CLEAR_FAILED: 'Failed to clear cart',
    MOVE_FAILED: 'Failed to move item to wishlist',
    ITEM_NOT_FOUND: 'Item not found in cart',
    EMPTY_CART: 'Cart is empty',
    INVALID_QUANTITY: 'Invalid quantity',
    INVALID_COUPON: 'Invalid coupon code',
    CHECKOUT_FAILED: 'Checkout failed'
  }
} as const;

export const WISHLIST_MESSAGES = {
  SUCCESS: {
    FETCHED: 'Wishlist items fetched successfully',
    ITEM_ADDED: 'Item added to wishlist',
    ITEM_REMOVED: 'Item removed from wishlist',
    CLEARED: 'Wishlist cleared successfully',
    MOVED_TO_CART: 'All items moved to cart successfully'
  },
  ERROR: {
    FETCH_FAILED: 'Failed to fetch wishlist items',
    ADD_FAILED: 'Failed to add item to wishlist',
    REMOVE_FAILED: 'Failed to remove item from wishlist',
    CLEAR_FAILED: 'Failed to clear wishlist',
    MOVE_FAILED: 'Failed to move items to cart',
    ITEM_NOT_FOUND: 'Item not found in wishlist',
    ALREADY_EXISTS: 'Item already in wishlist'
  }
} as const;

export const CATEGORY_MESSAGES = {
  SUCCESS: {
    CATEGORIES_FETCHED: 'Categories fetched successfully',
    CATEGORY_FOUND: 'Category found',
    PRODUCTS_FETCHED: 'Products fetched successfully',
    FILTERS_FETCHED: 'Filter options fetched successfully'
  },
  ERROR: {
    CATEGORIES_FETCH_FAILED: 'Failed to fetch categories',
    CATEGORY_NOT_FOUND: 'Category not found',
    PRODUCTS_FETCH_FAILED: 'Failed to fetch category products',
    FILTERS_FETCH_FAILED: 'Failed to fetch filter options',
    SEARCH_FAILED: 'Search failed'
  }
} as const;

export const ORDER_MESSAGES = {
  SUCCESS: {
    FETCHED: 'Orders fetched successfully',
    PLACED: 'Order placed successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully'
  },
  ERROR: {
    FETCH_FAILED: 'Failed to fetch orders',
    PLACE_FAILED: 'Failed to place order',
    UPDATE_FAILED: 'Failed to update order',
    CANCEL_FAILED: 'Failed to cancel order',
    NOT_FOUND: 'Order not found',
    INVALID_STATUS: 'Invalid order status'
  }
} as const;

export const CHECKOUT_MESSAGES = {
  SUCCESS: {
    ADDRESS_SAVED: 'Address saved successfully',
    ADDRESS_UPDATED: 'Address updated successfully',
    ADDRESS_DELETED: 'Address deleted successfully',
    PAYMENT_METHOD_SAVED: 'Payment method saved successfully',
    PAYMENT_METHOD_UPDATED: 'Payment method updated successfully',
    PAYMENT_METHOD_DELETED: 'Payment method deleted successfully',
    ORDER_PLACED: 'Order placed successfully',
    SHIPPING_CALCULATED: 'Shipping calculated successfully'
  },
  ERROR: {
    ADDRESS_SAVE_FAILED: 'Failed to save address',
    ADDRESS_UPDATE_FAILED: 'Failed to update address',
    ADDRESS_DELETE_FAILED: 'Failed to delete address',
    ADDRESS_NOT_FOUND: 'Address not found',
    PAYMENT_METHOD_SAVE_FAILED: 'Failed to save payment method',
    PAYMENT_METHOD_UPDATE_FAILED: 'Failed to update payment method',
    PAYMENT_METHOD_DELETE_FAILED: 'Failed to delete payment method',
    PAYMENT_METHOD_NOT_FOUND: 'Payment method not found',
    INVALID_ADDRESS: 'Please provide a valid address',
    INVALID_PAYMENT_METHOD: 'Please select a valid payment method',
    CHECKOUT_FAILED: 'Checkout failed. Please try again',
    SHIPPING_CALCULATION_FAILED: 'Failed to calculate shipping',
    PAYMENT_FAILED: 'Payment failed. Please try again'
  }
} as const;

export const PROFILE_MESSAGES = {
  SUCCESS: {
    FETCHED: 'Profile fetched successfully',
    UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PREFERENCES_UPDATED: 'Preferences updated successfully'
  },
  ERROR: {
    FETCH_FAILED: 'Failed to fetch profile',
    UPDATE_FAILED: 'Failed to update profile',
    PASSWORD_CHANGE_FAILED: 'Failed to change password',
    PREFERENCES_UPDATE_FAILED: 'Failed to update preferences',
    INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
    PASSWORD_MISMATCH: 'Passwords do not match'
  }
} as const;

export const SEARCH_MESSAGES = {
  SUCCESS: {
    RESULTS_FOUND: (count: number, query: string) => `Found ${count} products matching "${query}"`,
    SUGGESTIONS_FETCHED: 'Search suggestions fetched successfully'
  },
  ERROR: {
    SEARCH_FAILED: 'Search failed',
    NO_RESULTS: (query: string) => `No results found for "${query}"`,
    SUGGESTIONS_FAILED: 'Failed to fetch search suggestions'
  }
} as const;

export const IMAGE_GENERATION_MESSAGES = {
  SUCCESS: {
    GENERATION_STARTED: 'Image generation started. This may take a few moments...',
    GENERATION_COMPLETED: 'Image generated successfully!',
    TEMPLATES_FETCHED: 'Generation templates loaded successfully',
    HISTORY_FETCHED: 'Generation history loaded successfully',
    IMAGE_UPLOADED: 'Image uploaded successfully'
  },
  ERROR: {
    GENERATION_FAILED: 'Failed to generate image. Please try again',
    TEMPLATES_FETCH_FAILED: 'Failed to load generation templates',
    HISTORY_FETCH_FAILED: 'Failed to load generation history',
    INVALID_IMAGE: 'Please upload a valid image file',
    IMAGE_TOO_LARGE: 'Image file size is too large. Please upload a smaller image',
    UNSUPPORTED_FORMAT: 'Unsupported image format. Please upload JPEG, PNG, or WebP',
    MISSING_CUSTOMER_IMAGE: 'Please upload your photo',
    MISSING_PRODUCT_SELECTION: 'Please select a product',
    API_ERROR: 'API error occurred during generation',
    QUOTA_EXCEEDED: 'Generation quota exceeded. Please try again later'
  },
  INFO: {
    PROCESSING: 'Your image is being generated...',
    UPLOAD_PROMPT: 'Upload your photo to see how you\'ll look wearing our jewelry',
    SELECT_PRODUCT: 'Choose a product from your wishlist, cart, or search',
    QUALITY_TIP: 'For best results, use a clear, well-lit photo facing the camera'
  }
} as const;

export const GENERAL_MESSAGES = {
  SUCCESS: {
    OPERATION_SUCCESS: 'Operation completed successfully',
    DATA_SAVED: 'Data saved successfully',
    DATA_LOADED: 'Data loaded successfully'
  },
  ERROR: {
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    VALIDATION_ERROR: 'Please check your input and try again',
    UNKNOWN_ERROR: 'An unexpected error occurred',
    OPERATION_FAILED: 'Operation failed. Please try again'
  }
} as const;

// Export all message constants
export const MESSAGES = {
  AUTH: AUTH_MESSAGES,
  PRODUCT: PRODUCT_MESSAGES,
  CART: CART_MESSAGES,
  WISHLIST: WISHLIST_MESSAGES,
  CATEGORY: CATEGORY_MESSAGES,
  ORDER: ORDER_MESSAGES,
  CHECKOUT: CHECKOUT_MESSAGES,
  PROFILE: PROFILE_MESSAGES,
  SEARCH: SEARCH_MESSAGES,
  IMAGE_GENERATION: IMAGE_GENERATION_MESSAGES,
  GENERAL: GENERAL_MESSAGES
} as const;