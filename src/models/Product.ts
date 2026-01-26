// models/Product.ts

type Product = {
  id: number;
  name: string;
  description?: string;
  fotoUrl?: string;
  category: string; // "BOLOS" | "DOCINHOS" conforme o enum
  costPrice?: number | null; // Calculado automaticamente
  salePrice?: number | null; // Calculado automaticamente
  markupPercent?: number | null; // Definido na precificação
  priceStatus: string; // "NOT_CALCULATED" | "CALCULATED" | "PENDING"
  profitPercent?: number | null;
  expensePercent?: number | null;
  taxPercent?: number | null;
  minProfit?: number | null;
  weight?: number | null; // Peso em kg
  yield?: number | null; // Rendimento em unidades
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Relação com ingredientes (opcional, só carregada quando necessário)
  ingredients?: Array<{
    id: number;
    ingredientId: number;
    quantity: number;
    unit: string;
    totalCost: number;
    notes?: string;
    ingredient: {
      id: number;
      name: string;
      unit: string;
      unitCost: number;
      category?: string;
      supplier?: string;
    };
  }>;
}

export default Product;