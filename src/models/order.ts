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
    ProductionTask?: {
      id: number;
      status: string;
      completedQuantity: number;
      totalQuantity: number;
      pendingQuantity: number;
    };
  };
  producedQuantity?: number;
  isFullyProduced?: boolean;
  productionProgress?: number;
  productionStatus?: string;
  productionCounted?: boolean;
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
  | "IN_PRODUCTION"
  | "READY_FOR_DELIVERY"
  | "PRODUCTION_COMPLETE"
  | "DELIVERED"
  | "CANCELLED";

export default interface Order {
  id: number;
  customerId: number;
  userId: number;
  total: number;
  notes?: string | null;
  status: OrderStatus;
  orderDate?: string | Date;
  deliveryDate?: string | Date;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user?: User;
  items?: OrderItem[];
  
  productionSynced?: boolean;
  syncedAt?: string | Date;
}