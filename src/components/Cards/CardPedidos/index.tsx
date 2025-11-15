'use client';

import { ReactNode } from "react";
import styles from "./styles.module.css";
import Order from "@/models/order";

type Action = {
  label: string;
  onClick(): void;
};

type CardOrderProps = {
  title?: string;
  order: Order;
  loading?: boolean;
  actions?: Action[];
};

export default function CardOrder({ title, order, loading = false, actions }: CardOrderProps) {
  // Função para formatar datas aceitando undefined
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "—" : date.toLocaleDateString('pt-BR');
    } catch {
      return "—";
    }
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Andamento', 
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado',
      'PENDENTE': 'Pendente',
      'EM PRODUÇÃO': 'Em Produção',
      'CONCLUÍDO': 'Concluído',
      'btnStart': 'Iniciado'
    };
    return statusMap[status] || status;
  };

  // Função para formatar o total com segurança
  const formatTotal = (total: number | string | undefined) => {
    if (typeof total === 'number') {
      return `R$ ${total.toFixed(2)}`;
    }
    if (typeof total === 'string') {
      const num = parseFloat(total);
      return `R$ ${isNaN(num) ? '0.00' : num.toFixed(2)}`;
    }
    return "R$ 0.00";
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Pedido #{String(order.id).padStart(4, '0')}
      </h3>

      <div className={styles.info}>
        
        <p><strong>Cliente:</strong> {order.customer?.name || `ID: ${order.customerId}`}</p>
        
        {order.notes && <p><strong>Observações:</strong> {order.notes}</p>}
        
        <p><strong>Status:</strong> <strong>{formatStatus(order.status)}</strong></p>
        
        <p><strong>Total:</strong> {formatTotal(order.total)}</p>
        
        <p><strong>Data do pedido:</strong> {formatDate(order.orderDate)}</p>
        
        <p><strong>Data de entrega:</strong> {formatDate(order.deliveryDate)}</p>
        
        {order.items && order.items.length > 0 && (
          <div className={styles.items}>
            <strong>Itens:</strong>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.product?.name} - 
                  R$ {typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : '0.00'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={styles.button}
              disabled={loading}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}