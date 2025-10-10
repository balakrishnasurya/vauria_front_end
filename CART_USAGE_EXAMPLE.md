// Example of how to use the cart service in a component
// This demonstrates how to add items to cart and see real-time updates

import { cartService } from '@/services/cart.service';
import { useMainContext } from '@/context/MainContext';

export function ExampleProductComponent({ productId }: { productId: string }) {
  const { cartItemCount, refreshCartCount } = useMainContext();

  const handleAddToCart = async () => {
    try {
      const result = await cartService.addToCart(productId, 1);
      if (result.success) {
        console.log('Item added to cart successfully');
        // Cart count will automatically update via subscription
        // Optional: manually refresh if needed
        // await refreshCartCount();
      } else {
        console.error('Failed to add item to cart:', result.message);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  return (
    <div>
      <p>Current cart items: {cartItemCount}</p>
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

// The cart count in the header will automatically update when:
// 1. Items are added via cartService.addToCart()
// 2. Items are removed via cartService.removeFromCart()
// 3. Quantities are updated via cartService.updateQuantity()
// 4. Cart is cleared via cartService.clearCart()
// 5. App loads and cart is fetched from API
// 6. User logs in and their cart is loaded