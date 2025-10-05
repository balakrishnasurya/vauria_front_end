# Session Expiry Handling

This document explains how the automatic session expiry handling works in the Vauria application.

## Overview

The application now automatically detects when a user's JWT token has expired and logs them out with an appropriate message. This prevents users from encountering confusing authentication errors.

## How It Works

### 1. Token Expiry Detection
- The `httpService` checks all API responses for 401/403 status codes
- It looks for common error messages indicating token expiry:
  - "Invalid token"
  - "Token has expired" 
  - "Expired token"
  - "Authentication failed"
  - "Token expired"
  - "Session expired"
  - "Access denied"

### 2. Automatic Logout Process
When token expiry is detected:
1. The `httpService` triggers a session expiry callback
2. The `MainContext` handles the callback by:
   - Updating authentication state (sets `isAuthenticated` to false)
   - Clearing user data
   - Calling `authService.handleSessionExpiry()`
   - Redirecting to the login page

### 3. User Experience
- User sees "Your session has expired. Please login again." message on the login page
- After re-login, they can continue where they left off
- No confusing error messages or broken functionality

## Implementation Details

### Files Modified

1. **`src/services/http.service.ts`**
   - Added session expiry detection
   - Added callback mechanism for session expiry
   - Enhanced error handling for 401/403 responses

2. **`src/services/auth.service.ts`**
   - Added `handleSessionExpiry()` method
   - Enhanced `logout()` method with session expiry flag
   - Automatic message setting for session expiry

3. **`src/context/MainContext.tsx`**
   - Added session expiry callback setup
   - Integrated automatic logout on session expiry
   - State management for authentication status

### Usage Example

The system works automatically. When any API call receives an "Invalid token" response:

```
User Action: Add item to cart
↓
API Response: {"detail": "Invalid token"}
↓
HttpService detects token expiry
↓
MainContext handles session expiry
↓
User is logged out automatically
↓
Redirect to login with "Session expired" message
↓
User logs in again and continues
```

## Testing

To test session expiry handling:

1. Login to the application
2. Manually expire your token (or wait for natural expiry)
3. Try to perform any authenticated action (add to cart, view profile, etc.)
4. You should be automatically redirected to login with the session expired message

## Benefits

- **Improved UX**: No confusing error messages
- **Automatic handling**: No manual intervention required
- **Consistent behavior**: All API calls are protected
- **Clear messaging**: Users understand why they need to re-login
- **Seamless recovery**: Easy to continue after re-authentication

## Future Enhancements

Possible improvements:
- Token refresh mechanism
- Remember user's intended action for post-login redirect
- Session warning before expiry
- Graceful degradation for offline scenarios