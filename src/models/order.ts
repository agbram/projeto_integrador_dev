// models/order.ts
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    salePrice: number;
  };
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
}

export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "CANCELLED";

export default interface Order {
  id: number;
  customerId: number;
  userId: number;
  total: number;
  notes?: string | null;
  status: OrderStatus;
  deliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user?: User;
  items?: OrderItem[];
}
