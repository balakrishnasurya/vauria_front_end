# State Management: Authentication and Guards

This document explains how user authentication state is handled in this project today, and how you can implement an Auth Guard pattern if you want route-level protection. It’s written to be beginner-friendly and specific to this codebase.

---

## 1) Current Auth State Flow (Today)

### In short
- We store an access token (JWT) in `localStorage` after login
- On app load, we read and decode the token to derive user info
- `MainContext` holds `isAuthenticated` and `currentUser`
- UI shows different options (Login vs Profile/Logout) based on this state

### Where this happens

1. `auth.service.ts`
   - `login(...)`
     - Calls backend `BACKEND_ROUTES.LOGIN` via `httpService`
     - On success, stores token + metadata in `localStorage` using `localStorageService`
     - Decodes the JWT payload to infer `{ user_id, email, role }`
     - Stores a few convenience values (id, email) in `localStorage`
   - `getCurrentUser()`
     - Reads token from `localStorage`
     - Decodes payload → returns a `User` object or `null` if missing/invalid
   - `logout()`
     - Removes all auth-related keys from `localStorage`
   - `isAuthenticated()`
     - Returns `true` if a token exists in `localStorage`

2. `localStorage.service.ts`
   - A safe wrapper around `window.localStorage` (no-ops on server)
   - Provides JSON helpers and basic CRUD methods

3. `MainContext.tsx`
   - On initial mount (`useEffect`), calls `authService.getCurrentUser()`
     - If user exists → sets `currentUser` and `isAuthenticated = true`
     - Else → sets `isAuthenticated = false` and `currentUser = null`
   - Exposes navigation + auth handlers:
     - `handleLoginClick()` → show inline login on `/` or go to `/login`
     - `handleLogin()` → after login, refresh context, route to `/dashboard` for admin or `/profile` for users
     - `handleLogout()` → clears auth, sends user to `/`
   - Components (e.g., `Header`) receive `currentUser` and show a conditional dropdown (Login vs Profile/Logout)

### Diagram
```
Login → auth.service.login → localStorage (token)
        ↓
App mounts → MainContext.useEffect → auth.service.getCurrentUser
        ↓
MainContext: { isAuthenticated, currentUser }
        ↓
Header/Profile Menu & Route UI render conditionally
```

---

## 2) What is an Auth Guard?

An Auth Guard is a pattern that blocks access to specific pages (routes) unless the user is authenticated. If a user is not authenticated, they are redirected to a login page (or shown an inline login).

In Next.js App Router, there are a few common ways to implement guards:

- Client-side guard (inside a Client Component)
- Server-side guard (using middleware or server components)
- Layout-level guard (wrap an entire route subtree)

---

## 3) Simple Client-Side Guard (Recommended to start)

When you have a page that must only be visible if logged in, use a small hook inside that page.

Example: `src/app/profile/page.tsx`
```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMainContext } from '@/context/MainContext';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, showLoginInline, handleLoginClick } = useMainContext();

  useEffect(() => {
    if (!isAuthenticated) {
      // Option A: redirect to /login
      router.replace('/login');
      // Option B: open inline login if you’re on home
      // handleLoginClick();
    }
  }, [isAuthenticated, router, handleLoginClick]);

  if (!isAuthenticated) return null; // or a loading/skeleton

  return (
    <div>Protected Profile Content</div>
  );
}
```

Pros:
- Very easy to add to any page
- Uses existing `MainContext` state

Cons:
- Brief flash of unprotected UI can occur before redirect (you can hide with a skeleton)

---

## 4) Layout-Level Guard (Protect a group of routes)

If you want to protect a whole subtree, add a `layout.tsx` inside that folder and check auth there.

Example: protect everything under `/profile` (or `/account`):

```
src/app/account/layout.tsx
```
```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMainContext } from '@/context/MainContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useMainContext();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```

Pros:
- DRY: write the guard once for many pages

Cons:
- Still client-side; small flash possible

---

## 5) Server-Side Guard (Middleware-based)

For stronger protection and no UI flash, use Next.js Middleware to intercept unauthorized requests before rendering.

Create `middleware.ts` at project root:
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vauria_user_token')?.value; // requires storing token in cookies

  const isAuthRoute = request.nextUrl.pathname.startsWith('/profile')
                   || request.nextUrl.pathname.startsWith('/checkout');

  if (isAuthRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*'],
};
```

Notes:
- To make middleware work, store auth tokens in **cookies** (HTTPOnly is best) instead of `localStorage`. Your current auth flow uses localStorage; migrating to cookies improves security and allows server-side checks.
- You can still keep `MainContext` for client UI state (e.g., showing the user’s name), while using cookies for the server-side guard.

---

## 6) What should you implement now?

If you’re new and want the simplest path:

- Start with the **Client-Side Guard** per page or **Layout-Level Guard** for route groups.
- Use your existing `MainContext` state; you don’t need to change `auth.service.ts` yet.
- Later, when you integrate a real backend, consider migrating tokens to **HTTPOnly cookies** and add a **Middleware** guard for robust SSR protection.

---

## 7) How the UI reacts (today)

- `Header` shows a dropdown:
  - If `currentUser` is null → shows Login
  - If `currentUser` is set → shows Profile and Logout
- `MainLayout` injects handlers from `MainContext` into `Header`
- After `handleLogout()`:
  - localStorage cleared
  - `isAuthenticated = false`, `currentUser = null`
  - navigates to `/`

This is all driven by **reactive state** inside `MainContext`, which is initialized on app load by decoding any existing token.

---

## 8) Gotchas & Tips

- `localStorage` is not available on the server → never read it in Server Components; this repo reads it only in Client code (good).
- JWT decoding on the client is fine for UI state, but don’t trust it for sensitive server decisions.
- To avoid a visible redirect flash in client guards, render a lightweight skeleton while checking auth.
- Keep `MainContext` the source of truth for client UI; guards should only decide access/navigation.

---

## 9) Checklist for adding a guard

- Decide scope:
  - Single page → add client guard inside page
  - Multiple pages → add a layout guard
  - Strong, server-side → use middleware + cookies
- Keep `MainContext` as-is for UI state (quick wins)
- If using middleware, migrate token storage from localStorage → cookies
- Optionally support `?redirect=/target` to return users after login

---

With these patterns, you can confidently control access to routes while keeping your current state management intact and beginner-friendly. As you integrate a backend, shifting tokens to cookies and adding middleware will give you production-grade protection.
