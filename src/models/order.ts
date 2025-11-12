import { ReactNode } from "react";

type Order = {
    
  id?: number;
  customerId?: number;
  customerName?: string;       // opcional, caso queira exibir nome em vez do id
  description?: string;
  status?: string;
  notes?: string;
  total?: number | string;
  deliveryAddress?: ReactNode;
  orderDate?: string;
  deliveryDate?: string | null;
};

export default Order;
