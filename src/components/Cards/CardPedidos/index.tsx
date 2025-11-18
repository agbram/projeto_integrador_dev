"use client";

import styles from "./styles.module.css";
import Order from "@/models/order";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";

type Action = {
  label: ReactNode;
  onClick(): void;
};

type CardOrderProps = {
  title?: string;
  order: Order;
  loading?: boolean;
  actions?: Action[];
  onStatusUpdate?: (orderId: number, newStatus: string) => void;
  onDeliveredClick?: () => void; 
};

export default function CardOrder({
  title,
  order,
  loading = false,
  actions,
  onStatusUpdate,
  onDeliveredClick, 
}: CardOrderProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

  const handleMarkAsDelivered = async () => {
    if (onDeliveredClick) {
      onDeliveredClick();
    } else if (onStatusUpdate) {
      setIsUpdating(true);
      try {
        await onStatusUpdate(order.id, "DELIVERED");
      } catch (error) {
        console.error("Erro ao marcar pedido como entregue:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#6c757d',
      'IN_PROGRESS': '#17a2b8', 
      'IN_PRODUCTION': '#007bff',
      'READY_FOR_DELIVERY': '#28a745',
      'PRODUCTION_COMPLETE': '#28a745',
      'DELIVERED': '#20c997',
      'CANCELLED': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Andamento',
      'IN_PRODUCTION': 'Em Produção',
      'READY_FOR_DELIVERY': 'Pronto para Entrega',
      'PRODUCTION_COMPLETE': 'Produção Concluída',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const formatTotal = (total: number | string | undefined) => {
    if (typeof total === "number") {
      return `R$ ${total.toFixed(2)}`;
    }
    if (typeof total === "string") {
      const num = parseFloat(total);
      return `R$ ${isNaN(num) ? "0.00" : num.toFixed(2)}`;
    }
    return "R$ 0.00";
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Pedido #{String(order.id).padStart(4, "0")}
      </h3>

      <div className={styles.info}>
        <p>
          <strong>Cliente:</strong>{" "}
          {order.customer?.name || `ID: ${order.customerId}`}
        </p>

        {order.notes && (
          <p>
            <strong>Observações:</strong> {order.notes}
          </p>
        )}

        <p>
          <strong>Status: </strong>
          <span 
            className={styles.status} 
            style={{ 
              border: `2px solid ${getStatusColor(order.status)}`, 
              color: getStatusColor(order.status),
            }}
          >
            {formatStatus(order.status)}
          </span>
        </p>
        <p>
          <strong>Total:</strong> {formatTotal(order.total)}
        </p>
        <p>
          <strong>Data de criação pedido:</strong> {formatDate(order.orderDate)}
        </p>

        <p>
          <strong>Data de entrega:</strong> {formatDate(order.deliveryDate)}
        </p>


        {order.items && order.items.length > 0 && (
          <div className={styles.items}>
            <strong>Itens:</strong>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.product?.name} - R${" "}
                  {typeof item.unitPrice === "number"
                    ? item.unitPrice.toFixed(2)
                    : "0.00"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {order.status === "READY_FOR_DELIVERY" && (onStatusUpdate || onDeliveredClick) && (
        <div className={styles.deliveryAction}>
          <button
            onClick={handleMarkAsDelivered}
            className={styles.deliveredButton}
            disabled={(isUpdating && !onDeliveredClick) || loading} 
          >
            {isUpdating && !onDeliveredClick ? "Confirmando..." : "Entregue"}
          </button>
          <small className={styles.deliveryHelpText}>
            Clique para confirmar que o pedido foi entregue ao cliente
          </small>
        </div>
      )}

      {order.status === "DELIVERED" && (
        <div className={styles.deliveredContainer}>
          <div className={styles.deliveredBadge}>
            <CheckCircleIcon size={20} color="green" weight="fill" />
            <span>Pedido Entregue</span>
          </div>
          <small className={styles.deliveredDate}>
            <strong>Entregue em: {formatDate(order.updatedAt)}</strong>
          </small>
        </div>
      )}

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