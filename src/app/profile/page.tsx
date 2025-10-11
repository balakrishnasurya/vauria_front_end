'use client'

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User as UserIcon, MapPin, Package, Settings, Save, RotateCcw, Edit2, Trash2, Plus, Loader2, ChevronDown, ChevronRight, Calendar, Truck, CreditCard as CreditCardIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMainContext } from '@/context/MainContext';

import { profileService, type ProfileUpdateData, type PasswordChangeData } from '@/services/profile.service';
import { ordersService, type Order } from '@/services/orders.service';
import { productService } from '@/services/product.service';
import { type User, type Address, type PaymentMethod, type Product } from '@/models/interfaces/product.interface';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { handleLoginClick, handleLogoClick } = useMainContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<ProfileUpdateData>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [productCache, setProductCache] = useState<Map<number, Product>>(new Map());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionType, setActionType] = useState<'cancel' | 'return'>('return');

  // Password change form
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // New address form
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
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

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profileResponse = await profileService.getCurrentProfile();
      if (profileResponse.success) {
        setUser(profileResponse.data);
        setEditedUser({
          firstName: profileResponse.data.firstName,
          lastName: profileResponse.data.lastName,
          phone: profileResponse.data.phone,
          dateOfBirth: profileResponse.data.dateOfBirth,
          gender: profileResponse.data.gender,
          preferences: profileResponse.data.preferences
        });
      }

      // Load addresses
      const addressesResponse = await profileService.getUserAddresses();
      if (addressesResponse.success) {
        setAddresses(addressesResponse.data);
      }

      // Load orders
      const ordersResponse = await ordersService.getUserOrders();
      if (ordersResponse.success) {
        setOrders(ordersResponse.data);
      }

      // Load payment methods
      const paymentResponse = await profileService.getUserPaymentMethods();
      if (paymentResponse.success) {
        setPaymentMethods(paymentResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await profileService.updateProfile(editedUser);
      if (response.success) {
        setUser(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProfile = () => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        preferences: user.preferences
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    try {
      const response = await profileService.changePassword(passwordData);
      if (response.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        toast.success('Password changed successfully');
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await profileService.addAddress(newAddress);
      if (response.success) {
        setAddresses(prev => [...prev, response.data]);
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
        setShowAddressForm(false);
        toast.success('Address added successfully');
      } else {
        toast.error(response.message || 'Failed to add address');
      }
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await profileService.deleteAddress(addressId);
      if (response.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        toast.success('Address deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete address');
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await profileService.setDefaultAddress(addressId);
      if (response.success) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
        toast.success('Default address updated');
      } else {
        toast.error(response.message || 'Failed to update default address');
      }
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await profileService.deletePaymentMethod(paymentMethodId);
      if (response.success) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
        toast.success('Payment method deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete payment method');
      }
    } catch (error) {
      toast.error('Failed to delete payment method');
    }
  };

  const handleOrderAction = async (orderId: string, action: 'cancel' | 'return') => {
    setSelectedOrderForAction(orderId);
    setActionReason('');
    setActionType(action);
    setShowActionDialog(true);
  };

  const submitOrderAction = async () => {
    if (!selectedOrderForAction || !actionReason.trim()) {
      toast.error(`Please enter a reason for ${actionType}`);
      return;
    }

    try {
      let response;
      if (actionType === 'cancel') {
        response = await ordersService.cancelOrder(selectedOrderForAction, actionReason.trim());
      } else {
        response = await ordersService.requestReturn(selectedOrderForAction, actionReason.trim());
      }
      
      if (response.success) {
        // Update the order in the local state with the response data
        if (actionType === 'cancel' && response.data) {
          // For cancellation, use the complete updated order from API response
          setOrders(prev => prev.map(order => 
            order.id === selectedOrderForAction ? response.data : order
          ));
        } else if (actionType === 'return' && response.data) {
          // For return, use the complete updated order from API response
          setOrders(prev => prev.map(order => 
            order.id === selectedOrderForAction ? response.data : order
          ));
        } else {
          // Fallback to manual state update if no data in response
          setOrders(prev => prev.map(order => 
            order.id === selectedOrderForAction 
              ? { 
                  ...order, 
                  ...(actionType === 'cancel' 
                    ? { 
                        order_status: 'cancelled', 
                        status: 'cancelled',
                        cancel_reason: actionReason.trim(),
                        cancelled_at: new Date().toISOString()
                      }
                    : { 
                        return_request: true,
                        order_status: 'Return Requested'
                      })
                }
              : order
          ));
        }
        
        toast.success(`${actionType === 'cancel' ? 'Cancellation' : 'Return'} request submitted successfully`);
        setShowActionDialog(false);
        setSelectedOrderForAction(null);
        setActionReason('');
        
        // Refresh orders to get updated data from server
        loadProfileData();
      } else {
        toast.error(response.message || `Failed to submit ${actionType} request`);
      }
    } catch (error) {
      toast.error(`Failed to submit ${actionType} request`);
    }
  };

  const toggleOrderExpansion = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
        // Load product details when expanding
        loadProductsForOrder(order);
      }
      return newSet;
    });
  };

  const loadProductsForOrder = async (order: Order) => {
    setLoadingItems(prev => new Set(prev).add(order.id));
    
    try {
      const productPromises = order.items.map(async (item) => {
        const productId = Number(item.product_id);
        
        // Check cache first
        if (productCache.has(productId)) {
          return { productId, product: productCache.get(productId)! };
        }
        
        // Fetch from API
        try {
          const product = await productService.getProductById(productId);
          return { productId, product };
        } catch (error) {
          console.error(`Failed to load product ${productId}:`, error);
          return { productId, product: null };
        }
      });
      
      const results = await Promise.all(productPromises);
      
      // Update cache
      setProductCache(prev => {
        const newCache = new Map(prev);
        results.forEach(({ productId, product }) => {
          if (product) {
            newCache.set(productId, product);
          }
        });
        return newCache;
      });
    } catch (error) {
      console.error('Error loading products for order:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(order.id);
        return newSet;
      });
    }
  };

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out for delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'returned':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
            <Button onClick={handleLoginClick} className="mt-4">
              Log In
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            onClick={handleLogoClick}
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
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="font-sans text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Personal Information</CardTitle>
                    {/* Edit and Save buttons commented out as requested */}
                    {/* {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleResetProfile}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="gap-2"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    )} */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedUser.firstName || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedUser.lastName || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editedUser.phone || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedUser.dateOfBirth || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editedUser.gender || ''}
                        disabled
                      >
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security section commented out as requested */}
              {/* Change Password */}
              {/* <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleChangePassword} className="w-full">
                          Change Password
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card> */}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Saved Addresses</CardTitle>
                    <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={newAddress.firstName}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, firstName: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={newAddress.lastName}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, lastName: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="street">Street Address</Label>
                            <Textarea
                              id="street"
                              value={newAddress.street}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="addressType">Address Type</Label>
                            <Select 
                              value={newAddress.type} 
                              onValueChange={(value: 'home' | 'office' | 'other') => 
                                setNewAddress(prev => ({ ...prev, type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddAddress} className="w-full">
                            Add Address
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No addresses saved yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium">
                                  {address.firstName} {address.lastName}
                                </p>
                                {address.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded capitalize">
                                  {address.type}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.pincode}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.phone}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {/* Set Default button commented out as requested */}
                              {/* {!address.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id!)}
                                >
                                  Set Default
                                </Button>
                              )} */}
                              {/* Delete button commented out as requested */}
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id!)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No orders placed yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="border border-border hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            {/* Order Header - Compact */}
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base">#{order.id.slice(0, 8)}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.order_status)}`}>
                                  {order.order_status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Two Column Layout - Payment & Delivery */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              {/* Left Column - Payment Info */}
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Payment Status</p>
                                  <Badge 
                                    variant={
                                      order.status === 'paid' ? 'default' :
                                      order.status === 'cancelled' ? 'destructive' :
                                      order.status === 'returned' ? 'secondary' :
                                      'outline'
                                    }
                                    className="text-xs h-6"
                                  >
                                    {order.status === 'paid' ? 'Paid' : 
                                     order.status === 'cancelled' ? 'Cancelled' : 
                                     order.status === 'pending' ? 'Pending' : 
                                     order.status || 'Pending'}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Payment Method</p>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs h-6"
                                  >
                                    {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Right Column - Delivery Info */}
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Status</p>
                                  <div className="flex items-center gap-1 p-2 bg-muted/20 rounded text-xs h-6">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">{order.order_status}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Cost</p>
                                  <div className="flex items-center gap-1 p-2 bg-muted/20 rounded text-xs h-6">
                                    <Truck className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">{order.delivery_cost === '0.00' ? 'Free' : formatCurrency(order.delivery_cost)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Address - Below Two Columns */}
                            <div className="mb-3">
                              <div className="p-2 bg-muted/30 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Shipping To:
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {order.shipping_address}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons - Compact Layout */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="gap-2 text-xs h-7 px-3"
                              >
                                {expandedOrders.has(order.id) ? (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    Hide Items
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="h-3 w-3" />
                                    View Items ({order.items.length})
                                  </>
                                )}
                              </Button>

                              <div className="flex gap-2">
                                {/* Conditional Cancel/Return Button */}
                                {(() => {
                                  const status = order.order_status.toLowerCase();
                                  const isReturned = order.return_request;
                                  const isCancelled = status === 'cancelled';
                                  
                                  // Show Cancel button for processing, shipped, in transit, out for delivery
                                  if (['processing', 'shipped', 'in transit', 'out for delivery'].includes(status) && !isCancelled && !isReturned) {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOrderAction(order.id, 'cancel')}
                                        className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-3 text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    );
                                  }
                                  
                                  // Show Return button for delivered orders
                                  if (status === 'delivered' && !isReturned && !isCancelled) {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOrderAction(order.id, 'return')}
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50 h-7 px-3 text-xs"
                                      >
                                        Return
                                      </Button>
                                    );
                                  }
                                  
                                  // Show status for cancelled or returned orders
                                  if (isCancelled) {
                                    return (
                                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 border border-red-200 h-7 flex items-center">
                                        Cancelled
                                      </span>
                                    );
                                  }
                                  
                                  if (isReturned) {
                                    return (
                                      <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 border border-orange-200 h-7 flex items-center">
                                        Return Requested
                                      </span>
                                    );
                                  }
                                  
                                  return null;
                                })()}
                              </div>
                            </div>

                            {/* Action Dialog (Cancel/Return) */}
                            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                              <DialogContent className="max-w-md z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border shadow-lg">
                                <DialogHeader>
                                  <DialogTitle>
                                    {actionType === 'cancel' ? 'Cancel Order' : 'Request Return'}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="actionReason">
                                      Reason for {actionType === 'cancel' ? 'Cancellation' : 'Return'}
                                    </Label>
                                    <Textarea
                                      id="actionReason"
                                      placeholder={`Please provide a reason for ${actionType === 'cancel' ? 'cancelling' : 'returning'} this order...`}
                                      value={actionReason}
                                      onChange={(e) => setActionReason(e.target.value)}
                                      className="min-h-[100px] mt-2"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowActionDialog(false);
                                        setSelectedOrderForAction(null);
                                        setActionReason('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={submitOrderAction}
                                      disabled={!actionReason.trim()}
                                      className={`${actionType === 'cancel' 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-orange-600 hover:bg-orange-700'
                                      } text-white`}
                                    >
                                      Submit {actionType === 'cancel' ? 'Cancellation' : 'Return'} Request
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Expandable Items Section */}
                            {expandedOrders.has(order.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-border"
                              >
                                <p className="text-sm font-medium mb-2">Order Items</p>
                                {loadingItems.has(order.id) ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading items...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {order.items.map((item) => {
                                      const productId = Number(item.product_id);
                                      const product = productCache.get(productId);
                                      
                                      return (
                                        <div key={item.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                                          {product ? (
                                            <>
                                              <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                                <img 
                                                  src={product.image_url || 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/CHAINS.JPG'} 
                                                  alt={product.name}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://vauria-images.blr1.cdn.digitaloceanspaces.com/CHAINS.JPG';
                                                  }}
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{product.name}</p>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                  {product.material && `Material: ${product.material}`}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                  <div className="text-right">
                                                    <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                                                    {product.offer_price && product.offer_price < product.price && (
                                                      <p className="text-xs text-muted-foreground line-through">
                                                        {formatCurrency(product.price.toString())}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="flex justify-between items-center w-full">
                                              <div>
                                                <p className="text-sm text-muted-foreground">Product ID: {item.product_id}</p>
                                                <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                                <p className="text-xs text-red-500">Product details unavailable</p>
                                              </div>
                                              <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your orders and account
                      </p>
                    </div>
                    <Switch
                      checked={editedUser.preferences?.notifications || false}
                      onCheckedChange={(checked) => 
                        setEditedUser(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, notifications: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and updates
                      </p>
                    </div>
                    <Switch
                      checked={editedUser.preferences?.marketing || false}
                      onCheckedChange={(checked) => 
                        setEditedUser(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, marketing: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Theme Preference</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <Select
                      value={editedUser.preferences?.theme || 'dark'}
                      onValueChange={(value: 'light' | 'dark') => 
                        setEditedUser(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: value }
                        }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Save buttons commented out as requested */}
                  {/* {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleResetProfile}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="gap-2"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </div>
                  )} */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}