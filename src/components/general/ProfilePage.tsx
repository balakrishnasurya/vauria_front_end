import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User as UserIcon, MapPin, CreditCard, Settings, Save, RotateCcw, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
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

import { profileService, type ProfileUpdateData, type PasswordChangeData } from '@/services/profile.service';
import { type User, type Address, type PaymentMethod } from '@/models/interfaces/product.interface';
import { toast } from 'sonner';

interface ProfilePageProps {
  onBackToHome: () => void;
  onLoginClick: () => void;
}

export function ProfilePage({
  onBackToHome,
  onLoginClick
}: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<ProfileUpdateData>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
            <Button onClick={onLoginClick} className="mt-4">
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
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
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
                    {!isEditing ? (
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
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedUser.firstName || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedUser.lastName || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
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
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedUser.dateOfBirth || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editedUser.gender || ''}
                        onValueChange={(value: 'male' | 'female' | 'other') => 
                          setEditedUser(prev => ({ ...prev, gender: value }))
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
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

              {/* Change Password */}
              <Card className="border-border">
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
              </Card>
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
                              {!address.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id!)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id!)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No payment methods saved yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  {method.type === 'card' && `${method.provider} ${method.cardNumber}`}
                                  {method.type === 'upi' && `UPI: ${method.upiId}`}
                                  {method.type === 'cod' && 'Cash on Delivery'}
                                </p>
                                {method.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              {method.type === 'card' && (
                                <p className="text-sm text-muted-foreground">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
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
                  
                  {isEditing && (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}