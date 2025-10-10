import type { User, Address, PaymentMethod } from '@/models/interfaces/product.interface';
import { authService } from '@/services/auth.service';
import { localStorageService } from '@/services/localStorage.service';
import { httpService } from '@/services/http.service';
import { BACKEND_ROUTES } from '@/constants/routes/routes.constants';

export interface ProfileServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    notifications?: boolean;
    marketing?: boolean;
    theme?: 'light' | 'dark';
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response interfaces
export interface ApiUserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  gender: string | null;
  addresses: ApiAddress[];
  razorpay_customer_id: string | null;
}

export interface ApiAddress {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string | null;
  phone_number: string;
  address_type: string;
  is_default: boolean;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

class ProfileService {

  /**
   * Get current user profile from API
   */
  async getCurrentProfile(): Promise<ProfileServiceResponse<User>> {
    try {
      // Try to get profile from API first
      try {
        const response = await httpService.get(BACKEND_ROUTES.USER_PROFILE);
        
        if (response.ok) {
          const apiProfile: ApiUserProfile = await response.json();
          
          // Transform API response to our User interface
          const user: User = {
            id: apiProfile.id.toString(),
            email: apiProfile.email,
            firstName: apiProfile.first_name,
            lastName: apiProfile.last_name,
            phone: apiProfile.phone,
            role: apiProfile.role as 'customer' | 'admin',
            createdAt: new Date().toISOString(), // API doesn't provide this
            preferences: {
              notifications: true,
              marketing: false,
              theme: 'light'
            },
            // Transform addresses from API format to our format
            addresses: apiProfile.addresses.map(addr => ({
              id: addr.id.toString(),
              firstName: addr.first_name,
              lastName: addr.last_name || '',
              street: addr.address_line_1,
              city: addr.city,
              state: addr.state,
              pincode: addr.postal_code,
              country: addr.country,
              phone: addr.phone_number,
              type: addr.address_type === 'work' ? 'office' : addr.address_type as 'home' | 'office' | 'other',
              isDefault: addr.is_default
            }))
          };
          
          return {
            data: user,
            success: true,
            message: 'Profile fetched successfully from API'
          };
        }
      } catch (apiError) {
        console.error('API Error fetching profile:', apiError);
      }
      
      // Fallback: return empty profile
      return {
        data: {} as User,
        success: false,
        message: 'Profile not found'
      };
    } catch (error) {
      console.error('Error in getCurrentProfile:', error);
      return {
        data: {} as User,
        success: false,
        message: 'Failed to fetch profile'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdateData): Promise<ProfileServiceResponse<User>> {
    // TODO: Implement API call to update profile
    return {
      data: {} as User,
      success: false,
      message: 'Profile update not implemented'
    };
  }

  /**
   * Change password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<ProfileServiceResponse<boolean>> {
    // TODO: Implement API call to change password
    return {
      data: false,
      success: false,
      message: 'Password change not implemented'
    };
  }

  /**
   * Get user addresses from API
   */
  async getUserAddresses(): Promise<ProfileServiceResponse<Address[]>> {
    try {
      // Try to fetch from API first
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const res = await httpService.get(BACKEND_ROUTES.USER_ADDRESSES);
        if (res.ok) {
          const apiAddresses = await res.json();
          
          // Map API response to our Address interface
          const mappedAddresses: Address[] = apiAddresses.map((addr: any) => ({
            id: addr.id.toString(),
            firstName: addr.first_name || '',
            lastName: addr.last_name || '',
            street: addr.address_line_1, // address_line_1 maps to street
            city: addr.city,
            state: addr.state,
            pincode: addr.postal_code,
            country: addr.country,
            phone: addr.phone_number,
            type: addr.address_type === 'work' ? 'office' : addr.address_type as 'home' | 'office' | 'other',
            isDefault: addr.is_default
          }));
          
          return {
            data: mappedAddresses,
            success: true,
            message: 'Addresses fetched successfully from API'
          };
        }
      } catch (apiError) {
        console.error('API Error fetching addresses:', apiError);
      }
      
      // Fallback: return empty addresses
      return {
        data: [],
        success: true,
        message: 'No addresses found'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to fetch addresses'
      };
    }
  }

  /**
   * Add address using the API
   */
  async addAddress(address: Omit<Address, 'id'>): Promise<ProfileServiceResponse<Address>> {
    try {
      // Map the Address interface to API expected format
      const apiAddress = {
        first_name: address.firstName || '',
        last_name: address.lastName || '',
        phone_number: address.phone || '',
        address_type: address.type || 'home',
        is_default: address.isDefault || false,
        address_line_1: address.street, // Map street to address_line_1
        address_line_2: "", // Set address_line_2 to empty string as requested
        city: address.city,
        state: address.state,
        postal_code: address.pincode,
        country: address.country
      };

      try {
        // Try to add via API first
        const res = await httpService.post(BACKEND_ROUTES.USER_ADDRESSES, apiAddress);
        if (res.ok) {
          const apiResponse = await res.json();
          
          // Map API response back to our Address interface
          const newAddress: Address = {
            id: apiResponse.id.toString(),
            firstName: apiResponse.first_name || '',
            lastName: apiResponse.last_name || '',
            street: apiResponse.address_line_1, // address_line_1 maps to street
            city: apiResponse.city,
            state: apiResponse.state,
            pincode: apiResponse.postal_code,
            country: apiResponse.country,
            phone: apiResponse.phone_number,
            type: apiResponse.address_type === 'work' ? 'office' : apiResponse.address_type as 'home' | 'office' | 'other',
            isDefault: apiResponse.is_default
          };
          
          return {
            data: newAddress,
            success: true,
            message: 'Address added successfully via API'
          };
        }
      } catch (apiError) {
        console.error('API Error adding address:', apiError);
      }

      // Fallback: return error
      return {
        data: {} as Address,
        success: false,
        message: 'Failed to add address'
      };
    } catch (error) {
      return {
        data: {} as Address,
        success: false,
        message: 'Failed to add address'
      };
    }
  }

  /**
   * Update address using the API
   */
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<ProfileServiceResponse<Address>> {
    try {
      try {
        // First, get the current address to merge with updates
        const addressesResponse = await this.getUserAddresses();
        if (!addressesResponse.success) {
          throw new Error('Failed to fetch addresses');
        }

        const currentAddress = addressesResponse.data.find(addr => addr.id === addressId);
        if (!currentAddress) {
          return {
            data: {} as Address,
            success: false,
            message: 'Address not found'
          };
        }

        // Merge current address with updates
        const mergedAddress = { ...currentAddress, ...updates };

        // Map to API format
        const apiAddress = {
          first_name: mergedAddress.firstName || '',
          last_name: mergedAddress.lastName || '',
          phone_number: mergedAddress.phone || '',
          address_type: mergedAddress.type || 'home',
          is_default: mergedAddress.isDefault || false,
          address_line_1: mergedAddress.street, // Map street to address_line_1
          address_line_2: "", // Set address_line_2 to empty string
          city: mergedAddress.city,
          state: mergedAddress.state,
          postal_code: mergedAddress.pincode,
          country: mergedAddress.country
        };

        // Send update to API
        const res = await httpService.put(`${BACKEND_ROUTES.USER_ADDRESSES}/${addressId}`, apiAddress);
        if (res.ok) {
          const apiResponse = await res.json();
          
          // Map API response back to our Address interface
          const updatedAddress: Address = {
            id: apiResponse.id.toString(),
            firstName: apiResponse.first_name || '',
            lastName: apiResponse.last_name || '',
            street: apiResponse.address_line_1, // address_line_1 maps to street
            city: apiResponse.city,
            state: apiResponse.state,
            pincode: apiResponse.postal_code,
            country: apiResponse.country,
            phone: apiResponse.phone_number,
            type: apiResponse.address_type === 'work' ? 'office' : apiResponse.address_type as 'home' | 'office' | 'other',
            isDefault: apiResponse.is_default
          };
          
          return {
            data: updatedAddress,
            success: true,
            message: 'Address updated successfully via API'
          };
        }
      } catch (apiError) {
        console.error('API Error updating address:', apiError);
      }

      // Fallback: return error
      return {
        data: {} as Address,
        success: false,
        message: 'Failed to update address'
      };
    } catch (error) {
      return {
        data: {} as Address,
        success: false,
        message: 'Failed to update address'
      };
    }
  }

  /**
   * Delete address using the API
   */
  async deleteAddress(addressId: string): Promise<ProfileServiceResponse<boolean>> {
    try {
      try {
        // Try to delete via API first
        const res = await httpService.delete(`${BACKEND_ROUTES.USER_ADDRESSES}/${addressId}`);
        if (res.ok) {
          return {
            data: true,
            success: true,
            message: 'Address deleted successfully via API'
          };
        }
      } catch (apiError) {
        console.error('API Error deleting address:', apiError);
      }

      // Fallback: return error
      return {
        data: false,
        success: false,
        message: 'Failed to delete address'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to delete address'
      };
    }
  }

  /**
   * Set default address using the API
   */
  async setDefaultAddress(addressId: string): Promise<ProfileServiceResponse<boolean>> {
    try {
      try {
        // Try to set default via API first
        // First get the current address to preserve its data
        const addressesResponse = await this.getUserAddresses();
        if (!addressesResponse.success) {
          throw new Error('Failed to fetch addresses');
        }

        const currentAddress = addressesResponse.data.find(addr => addr.id === addressId);
        if (!currentAddress) {
          return {
            data: false,
            success: false,
            message: 'Address not found'
          };
        }

        // Map to API format with is_default set to true
        const apiAddress = {
          first_name: currentAddress.firstName || '',
          last_name: currentAddress.lastName || '',
          phone_number: currentAddress.phone || '',
          address_type: currentAddress.type || 'home',
          is_default: true, // Set this address as default
          address_line_1: currentAddress.street,
          address_line_2: "",
          city: currentAddress.city,
          state: currentAddress.state,
          postal_code: currentAddress.pincode,
          country: currentAddress.country
        };

        // Update the address with default flag set to true
        const res = await httpService.put(`${BACKEND_ROUTES.USER_ADDRESSES}/${addressId}`, apiAddress);
        if (res.ok) {
          return {
            data: true,
            success: true,
            message: 'Default address updated successfully via API'
          };
        }
      } catch (apiError) {
        console.error('API Error setting default address:', apiError);
      }

      // Fallback: return error
      return {
        data: false,
        success: false,
        message: 'Failed to update default address'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to update default address'
      };
    }
  }

  /**
   * Get user payment methods
   */
  async getUserPaymentMethods(): Promise<ProfileServiceResponse<PaymentMethod[]>> {
    // TODO: Implement API call to fetch payment methods
    return {
      data: [],
      success: false,
      message: 'Payment methods not implemented'
    };
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<ProfileServiceResponse<boolean>> {
    // TODO: Implement API call to delete payment method
    return {
      data: false,
      success: false,
      message: 'Payment method deletion not implemented'
    };
  }

  /**
   * Set current user (deprecated)
   */
  setCurrentUser(_userId: string): void {
    // Deprecated: no-op
  }
}

export const profileService = new ProfileService();