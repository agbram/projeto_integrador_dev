export interface ProductionTask {
  id: number;
  productId: number;
  totalQuantity: number;
  pendingQuantity: number;
  completedQuantity: number;
  status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  product?: {
    id: number;
    name: string;
    description?: string;
    category?: string;
  };
}

export type ProductionTaskCreateInput = Omit<ProductionTask, 'id' | 'createdAt' | 'updatedAt' | 'product'>;
export type ProductionTaskUpdateInput = Partial<ProductionTaskCreateInput>;