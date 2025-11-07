"use client";

import { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
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
    <Card style={{ width: "18rem" }} className={styles.card}>
      {/* Imagem do produto */}
      <Card.Img
        variant="top"
        src={imageSrc || "/placeholder.png"}
        alt={products.name}
        style={{
          height: "180px",
          objectFit: "cover",
          cursor: "pointer",
        }}
        onClick={() => setShowDetails(true)}
      />

      <Card.Body>
        {/* Cabeçalho com título e XIcon */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <Card.Title>{title || products.name || "Produto"}</Card.Title>

          {showDetails && (
            <XIcon
              weight="bold"
              size={22}
              onClick={() => setShowDetails(false)}
              style={{
                cursor: "pointer",
                color: "#444",
              }}
            />
          )}
        </div>

        {/* Conteúdo do card */}
        <Card.Text>
          {showDetails ? (
            <>
              <strong>Descrição:</strong> {products.description || "—"} <br />
              <strong>Preço de custo:</strong> R$ {products.costPrice?.toFixed(2)} <br />
              <strong>Markup:</strong> {products.markupPercent}% <br />
              <strong>Categoria:</strong> {products.category || "—"}
            </>
          ) : (
            "Clique na imagem para ver os detalhes."
          )}
        </Card.Text>

        {/* Botões de ação */}
        <div className={styles.teste}>
          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={styles.button}
            >
              {action.label}
            </button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
