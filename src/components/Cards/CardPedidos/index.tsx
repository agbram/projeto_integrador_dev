"use client";

import styles from "./styles.module.css";
import Order from "@/models/order";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";

enum Variant { 
  NotaFiscal = "notaFiscal", 
  Cancel = "cancel", 
  Edit = "edit"
};

type Action = {
  label: ReactNode;
  onClick(): void;
  variant?: Variant | string;
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

const formatDisplayDate = (dateString: string | null): string => {
  if (!dateString) return 'Não definida';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const year = adjustedDate.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'Não definida';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const year = adjustedDate.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return 'Data inválida';
  }
};

  const formatCurrency = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return "R$ 0,00";
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return "R$ 0,00";
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
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
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          Pedido #{String(order.id).padStart(4, "0")}
        </h3>
        <div 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: `${getStatusColor(order.status)}15`,
            border: `1px solid ${getStatusColor(order.status)}`,
            color: getStatusColor(order.status),
          }}
        >
          {formatStatus(order.status)}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Cliente:</span>
            <span className={styles.infoValue}>
              {order.customer?.name || `ID: ${order.customerId}`}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data do pedido:</span>
            <span className={styles.infoValue}>
              {formatDisplayDate(order.orderDate?.toString() || null)}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data de entrega:</span>
            <span className={styles.infoValue}><strong>{formatDisplayDate(order.deliveryDate?.toString() || null)}</strong>
              
            </span>
          </div>

          {order.discount !== 0 && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Desconto:</span>
              <span className={styles.discountValue}>{formatCurrency(order.discount)}</span>
            </div>
          )}

          {order.notes && (
            <div className={styles.fullWidthItem}>
              <span className={styles.infoLabel}>Observações:</span>
              <span className={styles.infoValue}>{order.notes}</span>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className={styles.fullWidthItem}>
              <span className={styles.infoLabel}>Itens:</span>
              <div className={styles.itemsList}>
                {order.items.map((item, index) => {                  
                  return (
                    <div key={index} className={styles.item}>
                      <span className={styles.itemQuantity}>{item.quantity}x</span>
                      <span className={styles.itemName}>
                        {item.product?.name}
                      </span>
                      <span className={styles.itemPrice}>
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        {order.status === "READY_FOR_DELIVERY" && (onStatusUpdate || onDeliveredClick) && (
          <div className={styles.deliverySection}>
            <button
              onClick={handleMarkAsDelivered}
              className={styles.deliveredButton}
              disabled={(isUpdating && !onDeliveredClick) || loading} 
            >
              {isUpdating && !onDeliveredClick ? "Confirmando..." : "Marcar como Entregue"}
            </button>
            <small className={styles.deliveryHelpText}>
              Clique para confirmar que o pedido foi entregue ao cliente
            </small>
          </div>
        )}

        {order.status === "DELIVERED" && (
          <div className={styles.deliveredSection}>
            <div className={styles.deliveredBadge}>
              <CheckCircleIcon size={20} color="green" weight="fill" />
              <span>Pedido Entregue</span>
            </div>
            <small className={styles.deliveredDate}>
              Entregue em: {formatDateTime(order.updatedAt?.toString() || null)}
            </small>
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className={styles.actionsSection}>
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`${styles.actionButton} ${styles[action.variant ?? ""]}`}
                disabled={loading}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
