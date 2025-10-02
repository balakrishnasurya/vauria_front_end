import { mockUsers } from '@/data/products.data';
import type { User, Address, PaymentMethod } from '@/models/interfaces/product.interface';
import { MESSAGES } from '../constants/messages.constants';
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

class ProfileService {
  private async resolveAuthUser(): Promise<{ authUser: User | null; id: string | null; email: string | null }> {
    try {
      const authUser = await authService.getCurrentUser();
      const id = authUser?.id ?? localStorageService.getItem('vauria_user_id');
      const email = authUser?.email ?? localStorageService.getItem('vauria_user_email');
      return { authUser: authUser ?? null, id: id ?? null, email: email ?? null };
    } catch {
      const id = localStorageService.getItem('vauria_user_id');
      const email = localStorageService.getItem('vauria_user_email');
      return { authUser: null, id: id ?? null, email: email ?? null };
    }
  }

  private findMockUserIndex(id: string | null, email: string | null): number {
    return mockUsers.findIndex(u => {
      const uid = (u.id as any)?.toString?.() ?? String(u.id);
      return (id && uid === id.toString()) || (email && u.email === email);
    });
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<ProfileServiceResponse<User>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const { authUser, id, email } = await this.resolveAuthUser();
      if (!id && !email) {
        return {
          data: {} as User,
          success: false,
          message: MESSAGES.AUTH.ERROR.USER_NOT_FOUND
        };
      }

      const idx = this.findMockUserIndex(id, email);
      if (idx !== -1) {
        return {
          data: mockUsers[idx],
          success: true,
          message: MESSAGES.PROFILE.SUCCESS.FETCHED
        };
      }

      if (authUser) {
        // Construct a minimal profile from the authenticated user
        const minimal: User = {
          id: authUser.id?.toString?.() ?? (id ?? 'unknown'),
          email: authUser.email ?? email ?? '',
          firstName: authUser.firstName ?? 'Demo',
          lastName: authUser.lastName ?? 'User',
          phone: authUser.phone,
          role: authUser.role ?? 'customer',
          createdAt: authUser.createdAt ?? new Date().toISOString(),
          preferences: authUser.preferences
        } as User;
        return {
          data: minimal,
          success: true,
          message: MESSAGES.PROFILE.SUCCESS.FETCHED
        };
      }

      return {
        data: {} as User,
        success: false,
        message: MESSAGES.AUTH.ERROR.USER_NOT_FOUND
      };
    } catch (error) {
      return {
        data: {} as User,
        success: false,
        message: MESSAGES.PROFILE.ERROR.FETCH_FAILED
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdateData): Promise<ProfileServiceResponse<User>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex === -1) {
        return {
          data: {} as User,
          success: false,
          message: MESSAGES.AUTH.ERROR.USER_NOT_FOUND
        };
      }

      // Update user data
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        preferences: {
          ...mockUsers[userIndex].preferences,
          ...updates.preferences
        }
      };

      return {
        data: mockUsers[userIndex],
        success: true,
        message: MESSAGES.PROFILE.SUCCESS.UPDATED
      };
    } catch (error) {
      return {
        data: {} as User,
        success: false,
        message: MESSAGES.PROFILE.ERROR.UPDATE_FAILED
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<ProfileServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return {
          data: false,
          success: false,
          message: MESSAGES.PROFILE.ERROR.PASSWORD_MISMATCH
        };
      }

      // Validate password strength
      if (passwordData.newPassword.length < 8) {
        return {
          data: false,
          success: false,
          message: MESSAGES.AUTH.ERROR.WEAK_PASSWORD
        };
      }

      // Mock current password validation (always passes for demo)
      // In real app, you'd verify the current password
      
      return {
        data: true,
        success: true,
        message: MESSAGES.PROFILE.SUCCESS.PASSWORD_CHANGED
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: MESSAGES.PROFILE.ERROR.PASSWORD_CHANGE_FAILED
      };
    }
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
            type: addr.address_type as 'home' | 'office' | 'other',
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
        // Fall back to mock data if API fails
      }
      
      // Fallback to mock data
      const { id, email } = await this.resolveAuthUser();
      const idx = this.findMockUserIndex(id, email);
      const user = idx !== -1 ? mockUsers[idx] : undefined;
      if (!user || !user.addresses) {
        return {
          data: [],
          success: true,
          message: 'No addresses found'
        };
      }

      return {
        data: user.addresses,
        success: true,
        message: 'Addresses fetched successfully from mock data'
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
            type: apiResponse.address_type as 'home' | 'office' | 'other',
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
        // Fall back to mock implementation if API fails
      }

      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: false
      };

      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex !== -1) {
        if (!mockUsers[userIndex].addresses) {
          mockUsers[userIndex].addresses = [];
        }
        mockUsers[userIndex].addresses!.push(newAddress);
      }

      return {
        data: newAddress,
        success: true,
        message: 'Address added successfully (mock)'
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
            type: apiResponse.address_type as 'home' | 'office' | 'other',
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
        // Fall back to mock implementation if API fails
      }

      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex === -1 || !mockUsers[userIndex].addresses) {
        return {
          data: {} as Address,
          success: false,
          message: 'Address not found'
        };
      }

      const addressIndex = mockUsers[userIndex].addresses!.findIndex((a: Address) => a.id === addressId);
      if (addressIndex === -1) {
        return {
          data: {} as Address,
          success: false,
          message: 'Address not found'
        };
      }

      const updatedAddress = { ...mockUsers[userIndex].addresses![addressIndex], ...updates };
      mockUsers[userIndex].addresses![addressIndex] = updatedAddress;

      return {
        data: updatedAddress,
        success: true,
        message: 'Address updated successfully (mock)'
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
        // Fall back to mock implementation if API fails
      }

      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex === -1 || !mockUsers[userIndex].addresses) {
        return {
          data: false,
          success: false,
          message: 'Address not found'
        };
      }

      const initialLength = mockUsers[userIndex].addresses!.length;
      mockUsers[userIndex].addresses = mockUsers[userIndex].addresses!.filter((a: Address) => a.id !== addressId);

      if (mockUsers[userIndex].addresses!.length === initialLength) {
        return {
          data: false,
          success: false,
          message: 'Address not found'
        };
      }

      return {
        data: true,
        success: true,
        message: 'Address deleted successfully (mock)'
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
        // Fall back to mock implementation if API fails
      }

      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex === -1 || !mockUsers[userIndex].addresses) {
        return {
          data: false,
          success: false,
          message: 'Address not found'
        };
      }

      // Remove default from all addresses
      mockUsers[userIndex].addresses!.forEach((addr: Address) => { addr.isDefault = false; });

      // Set new default
      const addressIndex = mockUsers[userIndex].addresses!.findIndex((a: Address) => a.id === addressId);
      if (addressIndex === -1) {
        return {
          data: false,
          success: false,
          message: 'Address not found'
        };
      }

      mockUsers[userIndex].addresses![addressIndex].isDefault = true;

      return {
        data: true,
        success: true,
        message: 'Default address updated successfully (mock)'
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
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { id, email } = await this.resolveAuthUser();
      const idx = this.findMockUserIndex(id, email);
      const user = idx !== -1 ? mockUsers[idx] : undefined;
      if (!user || !user.paymentMethods) {
        return {
          data: [],
          success: true,
          message: 'No payment methods found'
        };
      }

      return {
        data: user.paymentMethods,
        success: true,
        message: 'Payment methods fetched successfully'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to fetch payment methods'
      };
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<ProfileServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { id, email } = await this.resolveAuthUser();
      const userIndex = this.findMockUserIndex(id, email);
      if (userIndex === -1 || !mockUsers[userIndex].paymentMethods) {
        return {
          data: false,
          success: false,
          message: 'Payment method not found'
        };
      }

      const initialLength = mockUsers[userIndex].paymentMethods!.length;
  mockUsers[userIndex].paymentMethods = mockUsers[userIndex].paymentMethods!.filter((pm: PaymentMethod) => pm.id !== paymentMethodId);

      if (mockUsers[userIndex].paymentMethods!.length === initialLength) {
        return {
          data: false,
          success: false,
          message: 'Payment method not found'
        };
      }

      return {
        data: true,
        success: true,
        message: 'Payment method deleted successfully'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        message: 'Failed to delete payment method'
      };
    }
  }

  /**
   * Set current user (for testing purposes)
   */
  setCurrentUser(_userId: string): void {
    // Deprecated: no-op. Auth is resolved from token/local storage now.
  }
}

export const profileService = new ProfileService();