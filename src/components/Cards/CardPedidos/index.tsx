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
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title ?? `Pedido #${order.id ?? ""}`}</h3>

      <div className={styles.info}>
        <p><strong>ID do Pedido:</strong> {order.id}</p>
        <p><strong>ID Cliente:</strong> {order.customerId}</p>
        {order.customerName && <p><strong>Customer:</strong> {order.customerName}</p>}
        <p><strong>Descrição:</strong> {order.description}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> {typeof order.total === 'number' ? `R$ ${order.total.toFixed(2)}` : order.total}</p>
        <p><strong>Data do pedido:</strong> {order.orderDate}</p>
        <p><strong>Data de entrega:</strong> {order.deliveryDate ?? "—"}</p>
        {order.deliveryAddress && <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>}
      </div>

      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={styles.actionButton}
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
