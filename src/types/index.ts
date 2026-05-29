// Tipos espelhando os contratos (DTOs) do backend NestJS.

export type UserRole = 'ADMIN' | 'CUSTOMER';

export type OrderStatus = 'CREATED' | 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

/** Usuario resumido retornado no login. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  thumbnail: string;
  stock: number;
  price: number;
  active: boolean;
  createdAt: string;
  categoryId: string;
  category?: Category;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

// ---- Payloads de entrada ----

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateCategoryPayload {
  name: string;
  description: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface CreateProductPayload {
  name: string;
  description: string;
  image?: string;
  thumbnail?: string;
  stock: number;
  price: number;
  active?: boolean;
  categoryId: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

export interface CheckoutResponse {
  orderId: string;
  reference: string;
  amount: number;
  orderStatus: OrderStatus;
}

export interface GatewayChargeResponse {
  status: string;
  reference: string;
}
