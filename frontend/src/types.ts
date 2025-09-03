// Route status constants
export const RouteStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS", 
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

export type RouteStatus = typeof RouteStatus[keyof typeof RouteStatus];

// Order status constants
export const OrderStatus = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED"
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

// Order interface
export interface Order {
  id: number;
  route: number;
  code: string;
  customer_name: string;
  address: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Route {
    id: number;
    name: string;
    driver_name: string;
    status: RouteStatus;
    order_count?: number;
    delivered_count?: number;
    completion_percentage?: number;
    created_at: string;
    updated_at: string;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export interface RouteStatusUpdateRequest {
  status: RouteStatus;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
  