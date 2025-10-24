"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, CreditCard, Truck, Gift, CheckCircle, Loader2, Plus, Edit2, Check, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { cartService, type CartSummary } from '@/services/cart.service';
import { checkoutService, type ShippingCalculation, type ShippingRate, type OrderSummary, type Discount } from '@/services/checkout.service';
import { profileService } from '@/services/profile.service';
import { ordersService } from '@/services/orders.service';
import { paymentService } from '@/services/payment.service';
import { type Address, type PaymentMethod, type CheckoutData } from '@/models/interfaces/product.interface';
import { type CreateOrderRequest } from '@/services/orders.service';
import { toast } from 'sonner';
import { useMainContext } from '@/context/MainContext';

// Razorpay global declaration
declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Razorpay script loader
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    // if script already present
    if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']"))
      return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const { handleLogoClick: onBackToHome, handleCartClick: onCartClick, currentUser } = useMainContext();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('online');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState(false);

  // New Address Form
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    type: 'home',
    isDefault: false
  });

  // New Payment Method Form
  const [newPaymentMethod, setNewPaymentMethod] = useState<Omit<PaymentMethod, 'id'>>({
    type: 'card',
    provider: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardHolderName: currentUser?.name || '',
    upiId: '',
    isDefault: false
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      calculateShipping();
    }
  }, [selectedAddress, selectedPayment]); // Add selectedPayment dependency

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      // Load cart data
      const cartResponse = await cartService.getCartSummary();
      if (cartResponse.success) {
        setCartSummary(cartResponse.data);
      }

      // Load user addresses from API using profile service
      const addressesResponse = await profileService.getUserAddresses();
      if (addressesResponse.success) {
        setAddresses(addressesResponse.data);
        // Set default address
        const defaultAddr = addressesResponse.data.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressesResponse.data.length === 0) {
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const calculateShipping = async () => {
    if (!selectedAddress || !cartSummary) return;

    setLoadingShipping(true);
    try {
      // Extract address ID (assuming it exists on the address object)
      // If address doesn't have an ID, we'll need to create one or use a fallback
      const addressId = selectedAddress.id ? parseInt(selectedAddress.id.replace('addr-', '')) : 1;
      
      // Calculate total weight (assuming 0.5kg per item as default)
      const totalWeight = cartSummary.items.reduce((total, item) => total + (item.quantity * 0.5), 0);
      
      // Use cart subtotal with offer prices
      const totalAmount = cartSummary.items.reduce((total, item) => 
        total + ((item.offer_price || item.price) * item.quantity), 0
      );
      
      // Determine payment method
      const paymentMethod = selectedPayment === 'online' ? 'online' : 'cod';
      
      const response = await checkoutService.getShippingRates(
        addressId,
        totalWeight,
        totalAmount,
        paymentMethod
      );
      
      if (response.success && response.data.length > 0) {
        // Check if order qualifies for free express delivery (≥ ₹599)
        if (totalAmount >= 599) {
          // Show only free express delivery option
          const freeExpressOption: ShippingRate = {
            courier_id: 999, // Special ID for free express
            courier_name: "Free Express Delivery",
            rate: 0,
            etd: "5 days"
          };
          setShippingOptions([freeExpressOption]);
          setSelectedShipping(freeExpressOption);
        } else {
          // Show regular shipping options for orders below ₹599
          setShippingOptions(response.data);
          // Auto-select the cheapest option
          const cheapestOption = response.data.reduce((prev, current) => 
            prev.rate < current.rate ? prev : current
          );
          setSelectedShipping(cheapestOption);
        }
      } else {
        toast.error(response.message || 'No shipping options available for this address');
        setShippingOptions([]);
        setSelectedShipping(null);
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      toast.error('Failed to calculate shipping');
    } finally {
      setLoadingShipping(false);
    }
  };

  const addNewAddress = async () => {
    try {
      // Add address through API using profile service
      const response = await profileService.addAddress(newAddress);
      if (response.success) {
        setAddresses(prev => [...prev, response.data]);
        setSelectedAddress(response.data);
        setShowAddressForm(false);
        setNewAddress({
          firstName: '',
          lastName: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          phone: '',
          type: 'home',
          isDefault: false
        });
        toast.success('Address added successfully');
      } else {
        toast.error(response.message || 'Failed to add address');
      }
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const addNewPaymentMethod = async () => {
    try {
      const response = await checkoutService.addPaymentMethod(newPaymentMethod);
      if (response.success) {
        setSelectedPaymentMethod(response.data);
        setNewPaymentMethod({
          type: 'card',
          provider: '',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cardHolderName: currentUser?.name || '',
          upiId: '',
          isDefault: false
        });
        toast.success('Payment method added successfully');
      } else {
        toast.error(response.message || 'Failed to add payment method');
      }
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setValidatingDiscount(true);
    setDiscountError(false);
    try {
      const response = await checkoutService.validateDiscount(discountCode);
      if (response.success) {
        setAppliedDiscount(response.data);
        setDiscountError(false);
        toast.success(`Discount code '${response.data.code}' applied successfully!`);
      } else {
        setAppliedDiscount(null);
        setDiscountError(true);
        // Handle specific error messages from API
        const errorMessage = response.message || 'Invalid or expired discount code';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setAppliedDiscount(null);
      setDiscountError(true);
      toast.error('Failed to validate discount code. Please try again.');
    } finally {
      setValidatingDiscount(false);
    }
  };

  // Helper function to handle order revert and deletion
  const handleOrderRevert = async (orderId: string, reason: string) => {
    try {
      console.log(`Reverting and deleting order (${reason}):`, orderId);
      const revertResult = await ordersService.revertAndDeleteOrder(orderId, false); // soft delete
      
      if (revertResult.success) {
        console.log('Order reverted and deleted successfully:', revertResult.data);
        if (revertResult.data.deleted) {
          toast.success('Order cancelled, deleted, and cart restored');
        } else {
          toast.success('Order cancelled and cart restored (deletion may have failed)');
        }
        
        // Clear any stored payment credentials
        paymentService.clearStoredPaymentCredentials();
        paymentService.clearStoredPaymentResult();
        
        // Force refresh cart to show restored items
        await cartService.forceRefreshCart();
        
        return true;
      } else {
        console.error('Failed to revert order:', revertResult.message);
        toast.error('Failed to cancel order properly. Please contact support.');
        return false;
      }
    } catch (error) {
      console.error('Error reverting order:', error);
      toast.error('Error cancelling order. Please contact support.');
      return false;
    }
  };

  const calculateOrderSummary = (): OrderSummary => {
    if (!cartSummary) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0,
        shippingMethod: 'standard'
      };
    }

    // Calculate subtotal using offer prices
    const subtotalWithOfferPrices = cartSummary.items.reduce((total, item) => 
      total + ((item.offer_price || item.price) * item.quantity), 0
    );

    // Shipping cost logic: Always free for orders ≥ ₹599 when shipping rates are available
    const shippingCost = subtotalWithOfferPrices >= 599 ? 0 : (selectedShipping?.rate || 0);
    
    // Calculate online payment discount (5% off subtotal)
    const onlinePaymentDiscount = selectedPayment === 'online' 
      ? subtotalWithOfferPrices * 0.05
      : 0;
    
    // Calculate discount amount from discount codes
    let discountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'fixed') {
        discountAmount = appliedDiscount.value;
      } else if (appliedDiscount.type === 'percentage') {
        discountAmount = (appliedDiscount.value / 100) * subtotalWithOfferPrices;
      }
      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotalWithOfferPrices);
    }
    
    // Total calculation: subtotal + shipping - discounts
    const total = subtotalWithOfferPrices + shippingCost - onlinePaymentDiscount - discountAmount;

    return {
      subtotal: subtotalWithOfferPrices,
      shipping: shippingCost,
      tax: 0, // Tax removed as requested
      discount: discountAmount,
      total,
      shippingMethod: 'standard' // Keep for compatibility
    };
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !cartSummary || !selectedShipping) {
      toast.error('Please complete all required fields');
      return;
    }

    setProcessing(true);
    try {
      // Extract address ID for shipping_address_id
      const addressId = selectedAddress.id ? parseInt(selectedAddress.id.replace('addr-', '')) : 1;
      
      // Calculate subtotal to determine shipping cost
      const subtotal = cartSummary.items.reduce((total, item) => 
        total + ((item.offer_price || item.price) * item.quantity), 0
      );
      
      // Use 0 delivery cost for orders ≥ ₹599, otherwise use selected shipping rate
      const deliveryCost = subtotal >= 599 ? 0 : selectedShipping.rate;
      
      // Prepare order data with updated shipping information
      const orderData: CreateOrderRequest = {
        shipping_address_id: addressId,
        shipping_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
        billing_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
        payment_method: 'COD',
        shipping_method: selectedShipping.courier_name,
        carrier_name: selectedShipping.courier_name,
        delivery_option: selectedShipping.courier_name,
        order_notes: deliveryInstructions || '',
        delivery_cost: deliveryCost,
        ...(appliedDiscount && { discount_code: appliedDiscount.code })
      };

      // Create COD order
      const response = await ordersService.createCODOrder(orderData);

      if (response.success) {
        setOrderId(response.data.id);
        setOrderComplete(true);
        toast.success('Order placed successfully!');
        
        // Optionally clear the cart after successful order
        await cartService.clearCart();
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!selectedAddress || !cartSummary || !selectedShipping) {
      toast.error('Please complete all required fields');
      return;
    }

    setProcessing(true);
    try {
      // Extract address ID for shipping_address_id
      const addressId = selectedAddress.id ? parseInt(selectedAddress.id.replace('addr-', '')) : 1;
      
      // Calculate subtotal to determine shipping cost
      const subtotal = cartSummary.items.reduce((total, item) => 
        total + ((item.offer_price || item.price) * item.quantity), 0
      );
      
      // Use 0 delivery cost for orders ≥ ₹599, otherwise use selected shipping rate
      const deliveryCost = subtotal >= 599 ? 0 : selectedShipping.rate;
      
      // Prepare order data with updated shipping information
      const orderData: CreateOrderRequest = {
        shipping_address_id: addressId,
        shipping_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
        billing_address: `${selectedAddress.firstName} ${selectedAddress.lastName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}, ${selectedAddress.country}`,
        payment_method: 'online',
        shipping_method: selectedShipping.courier_name,
        carrier_name: selectedShipping.courier_name,
        delivery_option: selectedShipping.courier_name,
        order_notes: deliveryInstructions || '',
        delivery_cost: deliveryCost,
        ...(appliedDiscount && { discount_code: appliedDiscount.code })
      };

      // Create online order and generate payment credentials
      const result = await paymentService.createOnlineOrderWithPayment(orderData, ordersService);

      if (result.order.success && result.payment?.success) {
        toast.success('Order created! Opening payment gateway...');
        
        // Get the stored payment credentials
        const credentials = paymentService.getStoredPaymentCredentials();
        
        if (credentials) {
          // Load Razorpay script and open payment
          await openRazorpayPayment(credentials, result.order.data.id);
        } else {
          toast.error('Failed to load payment credentials');
        }
        
      } else {
        const errorMessage = result.payment?.message || result.order.message || 'Failed to initiate payment';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error processing online payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  // Razorpay payment function
  const openRazorpayPayment = async (credentials: any, orderIdFromDb: string) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway. Please try again.');
      
      // Revert order if payment gateway fails to load
      await handleOrderRevert(orderIdFromDb, 'payment gateway failure');
      return;
    }

    const options = {
      key: credentials.key_id,
      amount: credentials.amount,
      currency: "INR",
      name: "Vauria Jewelry",
      description: "Order Payment",
      order_id: credentials.razorpay_order_id,
      prefill: {
        name: currentUser?.name || "Customer",
        email: currentUser?.email || "customer@example.com",
        contact: "9999999999",
      },
      handler: async function (response: any) {
        // SUCCESS CASE: Razorpay sends response - existing flow unchanged
        // This handles successful payments and verification process
        
        // Store payment response
        paymentService.storePaymentResult(response);
        
        // Store payment details in component state for display
        setPaymentDetails({
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
        
        console.log("Payment successful, response:", response);
        toast.success('Payment completed! Verifying...');
        
        // Verify payment with server
        try {
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };
          
          const verificationResult = await paymentService.verifyPayment(verificationData);
          
          console.log('Payment verification result:', verificationResult);
          
          if (verificationResult.success && verificationResult.data.verified) {
            toast.success('Payment verified successfully!');
            setVerificationDetails({
              verified: true,
              message: verificationResult.data.message || 'Payment verified successfully',
              timestamp: new Date().toISOString()
            });
          } else {
            console.log('Payment verification failed:', verificationResult.data);
            setVerificationDetails({
              verified: false,
              message: verificationResult.data.message || 'Payment verification failed',
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error during payment verification:', error);
          toast.error('Payment verification failed');
          setVerificationDetails({
            verified: false,
            message: 'Network error during verification',
            timestamp: new Date().toISOString()
          });
        }
        
        // Set order as complete
        setOrderId(orderIdFromDb);
        setOrderComplete(true);
        
        // Clear payment credentials after successful payment
        paymentService.clearStoredPaymentCredentials();
        
        // Payment verification is now handled above
      },
      modal: {
        ondismiss: async function () {
          // FAILURE CASE: User closes Razorpay modal without payment
          console.log("Payment cancelled by user");
          toast.error('Payment was cancelled');
          
          // Revert the order when user closes payment modal
          await handleOrderRevert(orderIdFromDb, 'user cancelled payment');
        },
      },
      theme: {
        color: "#B8860B", // Vauria brand color
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping' && selectedAddress && selectedShipping) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && selectedPaymentMethod) {
      setCurrentStep('review');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">

        
        <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">

        
        <main className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-serif text-3xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="font-sans text-muted-foreground mb-2">
              Thank you for your order. Your order ID is:
            </p>
            <p className="font-mono text-lg font-semibold text-primary mb-6">
              {orderId}
            </p>
            
            {/* Payment Details Section */}
            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-muted/30 rounded-lg p-6 mb-6 max-w-2xl mx-auto"
              >
                <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                  Payment Details
                </h2>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-sans text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-sm text-foreground">{paymentDetails.payment_id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-sans text-muted-foreground">Razorpay Order ID:</span>
                    <span className="font-mono text-sm text-foreground">{paymentDetails.order_id}</span>
                  </div>
                  <div className="flex flex-col py-2">
                    <span className="font-sans text-muted-foreground mb-2">Signature:</span>
                    <span className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded border">
                      {paymentDetails.signature}
                    </span>
                  </div>
                </div>
                
                {/* Verification Status Section */}
                {verificationDetails && (
                  <div className={`mt-4 p-3 rounded-md border ${
                    verificationDetails.verified 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <CheckCircle className={`h-4 w-4 mr-2 ${
                        verificationDetails.verified ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        verificationDetails.verified ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {verificationDetails.verified ? 'Payment Verified Successfully' : 'Payment Verification Failed'}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`${verificationDetails.verified ? 'text-green-600' : 'text-red-600'}`}>
                        <strong>Status:</strong> {verificationDetails.message}
                      </div>
                      <div className={`${verificationDetails.verified ? 'text-green-600' : 'text-red-600'}`}>
                        <strong>Verified At:</strong> {new Date(verificationDetails.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                
                {!verificationDetails && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 text-yellow-500 mr-2 animate-spin" />
                      <span className="text-sm text-yellow-700 font-medium">Verifying Payment...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            <p className="font-sans text-muted-foreground mb-8">
              You will receive a confirmation email shortly with order details and tracking information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onBackToHome}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log('View order details')}
                className="border-border text-foreground hover:bg-muted font-sans"
              >
                View Order Details
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const orderSummary = calculateOrderSummary();
  const canProceedToPayment = currentStep === 'shipping' && selectedAddress && selectedShipping;
  const canProceedToReview = currentStep === 'payment' && selectedPaymentMethod;

  return (
    <div className="min-h-screen bg-background">
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
            onClick={onCartClick}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
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
            Secure Checkout
          </h1>
          <p className="font-sans text-muted-foreground">
            Complete your order in just a few simple steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4 lg:mb-8"
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-8">
            {/* STEP 2 AND 3 COMMENTED OUT - HANDLING EVERYTHING IN STEP 1
            {['shipping', 'payment', 'review'].map((step, index) => {
              const isActive = currentStep === step;
              const isCompleted = (currentStep === 'payment' && step === 'shipping') || 
                                (currentStep === 'review' && (step === 'shipping' || step === 'payment'));
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-sans text-xs sm:text-sm transition-all ${
                      isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-primary text-primary-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
                    </div>
                    <span className={`ml-1 sm:ml-2 font-sans text-xs sm:text-sm capitalize ${
                      isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-4 sm:w-8 md:w-16 h-0.5 mx-1 sm:mx-2 md:mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
            */}
            
            {/* Single Step: Order Details */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-sans text-xs sm:text-sm transition-all bg-primary text-primary-foreground">
                1
              </div>
              <span className="ml-1 sm:ml-2 font-sans text-xs sm:text-sm text-foreground font-medium">
                Order Details
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-6">
            
            {/* Order Details Section (combines shipping address, shipping options, and payment options) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <MapPin className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  {/* Existing Addresses */}
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="font-serif text-lg font-medium">Shipping Address</h3>
                      <RadioGroup 
                        value={selectedAddress?.id || ''} 
                        onValueChange={(value) => {
                          const addr = addresses.find(a => a.id === value);
                          if (addr) setSelectedAddress(addr);
                        }}
                      >
                          {addresses.map((address) => (
                            <div key={address.id} className="flex items-start space-x-2">
                              <RadioGroupItem value={address.id || ''} id={address.id} className="mt-1 min-w-[20px] min-h-[20px]" />
                              <div className="flex-1">
                                <Label htmlFor={address.id} className="cursor-pointer">
                                  <div className="p-3 lg:p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors touch-manipulation">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium font-sans">
                                          {address.firstName} {address.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-sans mt-1">
                                          {address.street}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-sans">
                                          {address.city}, {address.state} {address.pincode}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-sans">
                                          Phone: {address.phone}
                                        </p>
                                      </div>
                                      {address.isDefault && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-sans">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddressForm(true)}
                          className="w-full font-sans h-11 lg:h-10 touch-manipulation"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Address
                        </Button>
                      </div>
                    )}

                    {/* Add New Address Form */}
                    {(showAddressForm || addresses.length === 0) && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-lg font-medium">
                            {addresses.length === 0 ? 'Add Your Address' : 'Add New Address'}
                          </h3>
                          {addresses.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAddressForm(false)}
                              className="font-sans"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                          <div>
                            <Label htmlFor="firstName" className="font-sans text-sm lg:text-base">First Name *</Label>
                            <Input
                              id="firstName"
                              value={newAddress.firstName}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, firstName: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="font-sans text-sm lg:text-base">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={newAddress.lastName}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, lastName: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="street" className="font-sans text-sm lg:text-base">Street Address *</Label>
                          <Input
                            id="street"
                            placeholder="Enter your full address"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                            className="font-sans h-11 lg:h-10 touch-manipulation"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                          <div>
                            <Label htmlFor="city" className="font-sans text-sm lg:text-base">City *</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="state" className="font-sans text-sm lg:text-base">State *</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                          <div>
                            <Label htmlFor="pincode" className="font-sans text-sm lg:text-base">Pincode *</Label>
                            <Input
                              id="pincode"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="font-sans text-sm lg:text-base">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="addressType" className="font-sans text-sm lg:text-base">Address Type</Label>
                          <Select 
                            value={newAddress.type} 
                            onValueChange={(value: 'home' | 'office' | 'other') => 
                              setNewAddress(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger className="font-sans h-11 lg:h-10 touch-manipulation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="setDefault"
                            checked={newAddress.isDefault}
                            onCheckedChange={(checked) => 
                              setNewAddress(prev => ({ ...prev, isDefault: checked as boolean }))
                            }
                            className="min-w-[20px] min-h-[20px] touch-manipulation"
                          />
                          <Label htmlFor="setDefault" className="font-sans text-sm lg:text-base cursor-pointer">Set as default address</Label>
                        </div>
                        
                        <Button 
                          onClick={addNewAddress} 
                          className="w-full bg-primary hover:bg-primary/90 font-sans h-11 lg:h-10 touch-manipulation"
                          disabled={!newAddress.firstName || !newAddress.lastName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone}
                        >
                          Save Address
                        </Button>
                      </div>
                    )}

                    {/* Payment Options */}
                    {selectedAddress && (
                      <div className="pt-6 border-t border-border">
                        <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payment Options
                        </h3>
                        <RadioGroup value={selectedPayment} onValueChange={(value: 'cod' | 'online') => setSelectedPayment(value)}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="cod" id="cod" />
                              <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                                  <div>
                                    <p className="font-medium font-sans">Cash on Delivery</p>
                                    <p className="text-sm text-muted-foreground font-sans">Pay when you receive</p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="online" id="online" />
                              <Label htmlFor="online" className="flex-1 cursor-pointer">
                                <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                                  <div>
                                    <p className="font-medium font-sans">Pay Online</p>
                                    <p className="text-sm text-muted-foreground font-sans">Secure online payment</p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                        <p className="text-sm text-primary font-medium mt-3 flex items-center gap-1">
                          💰 Pay online to get 5% off on your order!
                        </p>
                      </div>
                    )}

                    {/* Shipping Options */}
                    {shippingOptions.length > 0 && selectedAddress && (
                      <div className="pt-6 border-t border-border">
                        <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          Shipping Options
                          {loadingShipping && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </h3>
                        {loadingShipping ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-3 border border-border rounded-lg animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <RadioGroup 
                            value={selectedShipping?.courier_id.toString()} 
                            onValueChange={(value) => {
                              const option = shippingOptions.find(opt => opt.courier_id.toString() === value);
                              if (option) setSelectedShipping(option);
                            }}
                          >
                            <div className="space-y-3">
                              {shippingOptions.map((option) => (
                                <div key={option.courier_id} className="flex items-center space-x-3">
                                  <RadioGroupItem value={option.courier_id.toString()} id={option.courier_id.toString()} />
                                  <Label htmlFor={option.courier_id.toString()} className="flex-1 cursor-pointer">
                                    <div className={`flex justify-between items-center p-3 border rounded-lg hover:bg-muted/20 transition-colors ${
                                      option.courier_id === 999 
                                        ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' 
                                        : 'border-border'
                                    }`}>
                                      <div>
                                        <p className={`font-medium font-sans ${
                                          option.courier_id === 999 ? 'text-green-700 dark:text-green-600' : ''
                                        }`}>
                                          {option.courier_name}
                                          {option.courier_id === 999 && (
                                            <span className="ml-2 text-sm font-normal">🎉</span>
                                          )}
                                        </p>
                                        <p className={`text-sm font-sans ${
                                          option.courier_id === 999 
                                            ? 'text-green-600 dark:text-green-500' 
                                            : 'text-muted-foreground'
                                        }`}>
                                          Expected delivery: {option.etd}
                                        </p>
                                      </div>
                                      <p className={`font-semibold font-sans ${
                                        option.courier_id === 999 
                                          ? 'text-green-700 dark:text-green-600' 
                                          : ''
                                      }`}>
                                        {option.rate === 0 ? 'FREE' : formatPrice(option.rate)}
                                      </p>
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        )}
                      </div>
                    )}

                    {shippingOptions.length === 0 && selectedAddress && !loadingShipping && (
                      <div className="pt-6 border-t border-border">
                        <div className="text-center py-8">
                          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">This address may not be serviceable</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Please select a different address or payment method to see available shipping options
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={calculateShipping}
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

            {/* PAYMENT METHOD SECTION - COMMENTED OUT FOR LATER USE
            {currentStep === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!selectedPaymentMethod ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPaymentMethod({ id: 'cod', type: 'cod', isDefault: false })}
                            className="h-14 lg:h-16 justify-start border-2 hover:border-primary font-sans touch-manipulation"
                          >
                            <div className="text-left">
                              <div className="font-medium text-sm lg:text-base">Cash on Delivery</div>
                              <div className="text-xs lg:text-sm text-muted-foreground">Pay when you receive</div>
                            </div>
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: 'upi', upiId: 'user@upi' }))}
                            className="h-14 lg:h-16 justify-start border-2 hover:border-primary font-sans touch-manipulation"
                          >
                            <div className="text-left">
                              <div className="font-medium text-sm lg:text-base">UPI Payment</div>
                              <div className="text-xs lg:text-sm text-muted-foreground">Quick & Secure</div>
                            </div>
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-serif text-lg font-medium">Credit/Debit Card</h3>
                          
                          <div>
                            <Label htmlFor="cardNumber" className="font-sans text-sm lg:text-base">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={newPaymentMethod.cardNumber}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cardHolder" className="font-sans text-sm lg:text-base">Card Holder Name *</Label>
                            <Input
                              id="cardHolder"
                              value={newPaymentMethod.cardHolderName}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardHolderName: e.target.value }))}
                              className="font-sans h-11 lg:h-10 touch-manipulation"
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 lg:gap-4">
                            <div>
                              <Label htmlFor="expiryMonth" className="font-sans text-sm lg:text-base">Month *</Label>
                              <Select 
                                value={newPaymentMethod.expiryMonth} 
                                onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                              >
                                <SelectTrigger className="font-sans h-11 lg:h-10 touch-manipulation">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                      {String(i + 1).padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="expiryYear" className="font-sans text-sm lg:text-base">Year *</Label>
                              <Select 
                                value={newPaymentMethod.expiryYear} 
                                onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                              >
                                <SelectTrigger className="font-sans h-11 lg:h-10 touch-manipulation">
                                  <SelectValue placeholder="YY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return (
                                      <SelectItem key={year} value={String(year).slice(-2)}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="cvv" className="font-sans text-sm lg:text-base">CVV *</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                maxLength={3}
                                className="font-sans h-11 lg:h-10 touch-manipulation"
                              />
                            </div>
                          </div>
                          
                          <Button 
                            onClick={addNewPaymentMethod} 
                            className="w-full bg-primary hover:bg-primary/90 font-sans h-11 lg:h-10 touch-manipulation"
                            disabled={!newPaymentMethod.cardNumber || !newPaymentMethod.cardHolderName || !newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear}
                          >
                            Save Payment Method
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium font-sans">
                                {selectedPaymentMethod.type === 'card' && `Card ending in ${selectedPaymentMethod.cardNumber?.slice(-4)}`}
                                {selectedPaymentMethod.type === 'upi' && `UPI: ${selectedPaymentMethod.upiId}`}
                                {selectedPaymentMethod.type === 'cod' && 'Cash on Delivery'}
                              </p>
                              {selectedPaymentMethod.cardHolderName && (
                                <p className="text-sm text-muted-foreground font-sans">
                                  {selectedPaymentMethod.cardHolderName}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="font-sans"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Change
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            */}

            {/* REVIEW SECTION - COMMENTED OUT FOR LATER USE
            {currentStep === 'review' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Gift className="h-5 w-5" />
                      Additional Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isGift"
                        checked={isGift}
                        onCheckedChange={(checked) => setIsGift(checked as boolean)}
                        className="min-w-[20px] min-h-[20px] touch-manipulation"
                      />
                      <Label htmlFor="isGift" className="font-sans text-sm lg:text-base cursor-pointer">This is a gift</Label>
                    </div>
                    
                    {isGift && (
                      <div>
                        <Label htmlFor="giftMessage" className="font-sans text-sm lg:text-base">Gift Message</Label>
                        <Textarea
                          id="giftMessage"
                          placeholder="Write a special message for the recipient..."
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="font-sans min-h-[80px] lg:min-h-[100px] touch-manipulation"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="deliveryInstructions" className="font-sans text-sm lg:text-base">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="deliveryInstructions"
                        placeholder="Any special delivery instructions..."
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="font-sans min-h-[80px] lg:min-h-[100px] touch-manipulation"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-serif">Order Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium font-sans mb-2">Shipping Address</h4>
                      <div className="text-sm text-muted-foreground font-sans">
                        <p>{selectedAddress?.firstName} {selectedAddress?.lastName}</p>
                        <p>{selectedAddress?.street}</p>
                        <p>{selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.pincode}</p>
                        <p>Phone: {selectedAddress?.phone}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium font-sans mb-2">Payment Method</h4>
                      <div className="text-sm text-muted-foreground font-sans">
                        {selectedPaymentMethod?.type === 'card' && `Card ending in ${selectedPaymentMethod.cardNumber?.slice(-4)}`}
                        {selectedPaymentMethod?.type === 'upi' && `UPI: ${selectedPaymentMethod.upiId}`}
                        {selectedPaymentMethod?.type === 'cod' && 'Cash on Delivery'}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium font-sans mb-2">Shipping Method</h4>
                      <div className="text-sm text-muted-foreground font-sans capitalize">
                        {selectedShipping?.courier_name} - {selectedShipping?.etd}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            */}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartSummary && (
                    <>
                      <div className="space-y-2 font-sans">
                        <div className="flex justify-between">
                          <span>Subtotal ({cartSummary?.itemCount || 0} items)</span>
                          <span>
                            {formatPrice(
                              cartSummary?.items.reduce((total, item) => 
                                total + ((item.offer_price || item.price) * item.quantity), 0
                              ) || 0
                            )}
                          </span>
                        </div>
                        
                        {/* Shipping Cost Display */}
                        {(cartSummary?.items.reduce((total, item) => 
                          total + ((item.offer_price || item.price) * item.quantity), 0
                        ) || 0) >= 599 ? (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>🎉 Free Delivery</span>
                            <span>₹0</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {selectedShipping && orderSummary.shipping > 0 && (
                              <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{formatPrice(orderSummary.shipping)}</span>
                              </div>
                            )}
                            <div className="text-xs text-green-600 font-medium">
                              💰 Shop above ₹599 for free delivery!
                            </div>
                          </div>
                        )}
                        
                        {/* Online Payment Discount */}
                        {selectedPayment === 'online' && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>Online Payment Discount (5% off)</span>
                            <span>
                              -{formatPrice(
                                (cartSummary?.items.reduce((total, item) => 
                                  total + ((item.offer_price || item.price) * item.quantity), 0
                                ) || 0) * 0.05
                              )}
                            </span>
                          </div>
                        )}
                        {orderSummary.discount > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>Discount</span>
                            <span>-{formatPrice(orderSummary.discount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Discount Code Section */}
                      <div className="pt-2">
                        <Label htmlFor="discountCode" className="font-sans text-sm mb-2 flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" />
                          Discount Code
                        </Label>
                        <div className="space-y-2">
                          {!appliedDiscount ? (
                            <div className="flex gap-2">
                              <Input
                                id="discountCode"
                                placeholder="Enter discount code"
                                value={discountCode}
                                onChange={(e) => {
                                  setDiscountCode(e.target.value.toUpperCase());
                                  setDiscountError(false); // Clear error state when user types
                                }}
                                className={`font-sans h-11 lg:h-10 touch-manipulation ${
                                  discountError ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                                disabled={validatingDiscount}
                              />
                              <Button 
                                onClick={validateDiscountCode}
                                variant="outline"
                                className="font-sans h-11 lg:h-10 touch-manipulation whitespace-nowrap border-2 hover:border-primary min-w-[80px]"
                                disabled={validatingDiscount || !discountCode.trim()}
                              >
                                {validatingDiscount ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Validating
                                  </>
                                ) : (
                                  'Apply'
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="p-3 lg:p-4 border-2 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="font-medium font-sans text-sm flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    {appliedDiscount.code}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-sans">
                                    {appliedDiscount.type === 'fixed' 
                                      ? `${formatPrice(appliedDiscount.value)} discount applied` 
                                      : `${appliedDiscount.value}% discount applied`}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setAppliedDiscount(null);
                                    setDiscountCode('');
                                    setDiscountError(false);
                                  }}
                                  className="text-muted-foreground hover:text-destructive font-sans -mt-1 -mr-2"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-sans font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(orderSummary.total)}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2 pt-4">
                    {/* Conditional button based on payment option */}
                    {selectedAddress && (shippingOptions.length > 0 || (cartSummary?.items.reduce((total, item) => 
                      total + ((item.offer_price || item.price) * item.quantity), 0
                    ) || 0) >= 599) ? (
                      selectedPayment === 'cod' ? (
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={processing}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Place Order - ${formatPrice(orderSummary.total)}`
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleOnlinePayment}
                          disabled={processing}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Continue to Payment - ${formatPrice(orderSummary.total)}`
                          )}
                        </Button>
                      )
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-muted text-muted-foreground font-sans"
                      >
                        Please complete all required fields
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground font-sans pt-4 border-t border-border">
                    <p className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Free returns within 7 days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}