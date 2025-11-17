"use client";

import { useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import styles from "./styles.module.css";

type Action = {
  label: string;
  onClick(): void;
};

type CardProductProps = {
  title?: string;
  products: Product;
  loading?: boolean;
  actions?: Action[];
};

export default function CardProduto({
  title,
  products,
  loading = false,
  actions,
}: CardProductProps) {
  const urlBase = "http://localhost:4000";
  const imageSrc = products.fotoUrl ? `${urlBase}${products.fotoUrl}` : "";
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={styles.container}>
      {/* Imagem do produto */}
      <img
        src={imageSrc || "/placeholder.png"}
        alt={products.name}
        className={styles.cardImage}
        onClick={() => setShowDetails(true)}
      />

      {/* Cabeçalho */}
      <div className={styles.header}>
        <h5 className={styles.title}>{title || products.name || "Produto"}</h5>

        {showDetails && (
          <XIcon
            weight="bold"
            size={22}
            onClick={() => setShowDetails(false)}
            className={styles.icon}
          />
        )}
      </div>

      {/* Texto quando detalhes não estão visíveis */}
      {!showDetails && (
        <p className={styles.clickHint}>
          Clique na imagem para obter mais detalhes
        </p>
      )}

      {/* Detalhes do produto */}
      <div className={`${styles.info} ${showDetails ? styles.show : ""}`}>
        <p>
          <strong>Descrição:</strong> {products.description || "—"}
        </p>
        <p>
          <strong>Preço de custo:</strong> R$ {products.costPrice?.toFixed(2) || "0.00"}
        </p>
        <p>
          <strong>Markup:</strong> {products.markupPercent || 0}%
        </p>
        <p>
          <strong>Categoria:</strong> {products.category || "—"}
        </p>
        <p>
          <strong>Preço de venda:</strong> {products.salePrice?.toFixed(2) || "0.00"}
        </p>
      </div>

      {/* Botões de ação */}
      <div className={styles.teste}>
        {actions?.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={styles.button}
            disabled={loading}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
