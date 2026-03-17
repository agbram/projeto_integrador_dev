export interface FixedExpense {
  id: number;
  description: string;
  value: number;
  date: string; // ISO string
  recurring: boolean;
  category: string | null;
  note: string | null;
  isActive?: boolean; // se usar soft delete
  createdAt: string;
  updatedAt: string;
}

export default FixedExpense;