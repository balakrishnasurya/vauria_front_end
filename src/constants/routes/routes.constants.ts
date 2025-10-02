const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const BACKEND_ROUTES = {

  LOGIN: `${BASE_URL}/api/v1/login`,
  SIGNUP: `${BASE_URL}/api/v1/signup`,
  PRODUCTS: `${BASE_URL}/api/v1/products`,
  PRODUCTFROMSLUG: (slug: string) => `${BASE_URL}/api/v1/products/slug/${slug}`,
  CART: `${BASE_URL}/api/v1/cart/`,
  CART_ITEMS: `${BASE_URL}/api/v1/cart/items`,
  CART_ITEM_DELETE: (itemId: string) => `${BASE_URL}/api/v1/cart/items/${itemId}`,
  CART_ITEM_UPDATE: (itemId: string) => `${BASE_URL}/api/v1/cart/items/${itemId}`,
  USER_ADDRESSES: `${BASE_URL}/api/v1/me/addresses`,
  ORDERS: `${BASE_URL}/api/v1/orders/`,
  ORDERS_COD: `${BASE_URL}/api/v1/orders/cod`,
  ORDERS_ONLINE: `${BASE_URL}/api/v1/orders/online`,
  PAYMENTS_CREATE: `${BASE_URL}/api/v1/payments/create`,
  PAYMENTS_VERIFY: `${BASE_URL}/api/v1/payments/verify`,
};