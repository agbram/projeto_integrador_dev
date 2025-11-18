"use client";

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

export default function CardOrder({
  title,
  order,
  loading = false,
  actions,
}: CardOrderProps) {
  // Função para formatar datas aceitando undefined
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

const getStatusClass = (status: string) => {
  const classMap: { [key: string]: string } = {
    'PENDING': styles.statusPending,
    'IN_PROGRESS': styles.statusInProgress,
    'IN_PRODUCTION': styles.statusInProduction,
    'READY_FOR_DELIVERY': styles.statusReadyForDelivery,
    'PRODUCTION_COMPLETE': styles.statusProductionComplete,
    'DELIVERED': styles.statusDelivered,
    'CANCELLED': styles.statusCancelled
  };
  return classMap[status] || styles.statusPending;
};

  // Função para formatar status
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

  // Função para formatar o total com segurança
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
          <strong>Status:</strong>
          <span className={`${styles.status} ${getStatusClass(order.status)}`}>
             {formatStatus(order.status)}
          </span>
        </p>
        <p>
          <strong>Total:</strong> {formatTotal(order.total)}
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
                  {typeof item.subtotal === "number"
                    ? item.subtotal.toFixed(2)
                    : "0.00"}
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
