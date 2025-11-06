'use client';

import { ReactNode } from "react";
import styles from "./styles.module.css";
import { ReactNode } from "react"
import styles from "./styles.module.css"
import { strict } from "assert"
import Button from 'react-bootstrap/Button';

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

export default function CardProduto({ title, products, loading = true, actions }: CardProductProps) {


  const urlBase = 'http://localhost:4000';
  const imageSrc = `${urlBase}${products.fotoUrl}`; //getImageSrc(products.fotoUrl);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title || "Produto"}</h3>

      <div className={styles.info}>
        <p><strong>ID:</strong> {products.id}</p>
        <p><strong>Nome:</strong> {products.name}</p>
        <p><strong>Descrição:</strong> {products.description}</p>
        <p><strong>Preço de custo:</strong> {products.costPrice}</p>
        <p><strong>Markup:</strong> {products.markupPercent}%</p>
        <p><strong>Categoria:</strong> {products.category}</p>

        {/* ✅ Exibe a imagem corretamente */}
        <div style={{ marginTop: "10px" }}>
          <strong>Imagem:</strong>
          {imageSrc ? (
            <div>
              <img
                src={imageSrc}
                alt={products.name}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginTop: "5px",
                }}
              />
            </div>
          ) : (
            <p>Não disponível</p>
          )}
        </div>

        {/* Ações */}
        <div style={{ marginTop: "10px" }}>
          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={styles.button}
              style={{ marginRight: "8px" }}
            >
              {action.label}
            </button>
          ))}
        
        <div>
          <Button variant="dark" >Editar</Button>
        </div>
      </div>
    </div>
  );
}
