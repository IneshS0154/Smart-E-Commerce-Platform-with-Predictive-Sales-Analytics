export interface ReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userFirstName: string;
  userLastName: string;
  rating: number;
  comment: string;
  approved: boolean;
  flagged: boolean;
  flagReason: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SUPPORT_STAFF' | 'SUPPLIER';
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  sku: string | null;
  supplierId: number | null;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  category: string | null;
  brand: string | null;
  imageUrl: string | null;
  sku: string | null;
  active: boolean;
  supplierId: number | null;
  supplierName: string | null;
  averageRating: number | null;
  reviewCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId: string;
}
