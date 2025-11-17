"use client";

import { useState, useEffect } from "react";
import { XIcon, Info } from "@phosphor-icons/react";
import styles from "./styles.module.css";

type Action = {
  label: string;
  onClick(): void;
};

type Product = {
  name: string;
  fotoUrl?: string;
  description?: string;
  costPrice?: number;
  markupPercent?: number;
  category?: string;
  salePrice?: number;
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
  const imageSrc = products.fotoUrl ? `${urlBase}${products.fotoUrl}` : "/placeholder.png";
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fecha sidebar ao apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSidebar(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* CARD PRINCIPAL */}
      <div 
        className={`${styles.container} ${isMobile ? styles.mobile : ''}`}
        onClick={() => isMobile && setShowSidebar(true)}
      >
        {/* Imagem do produto */}
        <div className={styles.imageContainer}>
          <img
            src={imageSrc}
            alt={products.name}
            className={styles.cardImage}
          />
          {isMobile && (
            <div className={styles.mobileOverlay}>
              <Info size={20} className={styles.infoIcon} />
              <span>Toque para detalhes</span>
            </div>
          )}
        </div>

        {/* Conteúdo - versão reduzida no mobile */}
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{title || products.name || "Produto"}</h3>
          </div>

          {/* No mobile mostra apenas informações essenciais */}
          {!isMobile ? (
            // VERSÃO DESKTOP - Todas as informações
            <div className={styles.info}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Descrição:</span>
                <span className={styles.value}>{products.description || "—"}</span>
              </div>
              
              <div className={styles.detailsGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Preço custo:</span>
                  <span className={styles.value}>R$ {products.costPrice?.toFixed(2) || "0.00"}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.label}>Markup:</span>
                  <span className={styles.value}>{products.markupPercent || 0}%</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.label}>Categoria:</span>
                  <span className={styles.value}>{products.category || "—"}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.label}>Preço venda:</span>
                  <span className={`${styles.value} ${styles.highlight}`}>
                    R$ {products.salePrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // VERSÃO MOBILE - Apenas informações essenciais
            <div className={styles.mobileInfo}>
              <div className={styles.mobilePrice}>
                <span className={styles.priceLabel}>Preço:</span>
                <span className={styles.priceValue}>R$ {products.salePrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className={styles.mobileCategory}>
                {products.category || "Sem categoria"}
              </div>
            </div>
          )}

          {/* Botões - desktop sempre, mobile apenas se não tiver sidebar */}
          {(!isMobile || !showSidebar) && actions && actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className={styles.button}
                  disabled={loading}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR PARA MOBILE */}
      {isMobile && showSidebar && (
        <>
          {/* Overlay escuro */}
          <div 
            className={styles.sidebarOverlay}
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Header da sidebar */}
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Detalhes do Produto</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowSidebar(false)}
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Conteúdo da sidebar */}
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarImage}>
                <img
                  src={imageSrc}
                  alt={products.name}
                  className={styles.sidebarImg}
                />
              </div>

              <div className={styles.sidebarInfo}>
                <h4 className={styles.productName}>{products.name}</h4>
                
                <div className={styles.infoSection}>
                  <h5 className={styles.sectionTitle}>Descrição</h5>
                  <p className={styles.sectionText}>{products.description || "Sem descrição"}</p>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Preço de custo:</span>
                    <span className={styles.detailValue}>R$ {products.costPrice?.toFixed(2) || "0.00"}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Markup:</span>
                    <span className={styles.detailValue}>{products.markupPercent || 0}%</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Categoria:</span>
                    <span className={styles.detailValue}>{products.category || "—"}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Preço de venda:</span>
                    <span className={styles.detailValueHighlight}>
                      R$ {products.salePrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                {/* Botões na sidebar */}
                {actions && actions.length > 0 && (
                  <div className={styles.sidebarActions}>
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={styles.sidebarButton}
                        disabled={loading}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}