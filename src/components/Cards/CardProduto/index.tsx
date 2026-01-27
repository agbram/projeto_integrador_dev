"use client";

import { useState, useEffect } from "react";
import { XIcon, InfoIcon } from "@phosphor-icons/react";
import styles from "./styles.module.css";
import Product from "@/models/Product";
import api from "@/services/api";

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
  const API_URL = api; // URL do backend
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageError, setImageError] = useState(false);

const getImageUrl = (fotoUrl: string | undefined | null): string => {
  if (!fotoUrl) {
    return "/placeholder.png";
  }

  console.log("📸 Foto URL do banco:", fotoUrl);


  // Remove qualquer prefixo /imagens/ se existir
  const nomeArquivo = fotoUrl.replace(/^\/?imagens\//, '');
  
  // Retorna URL completa
  return `https://${api}/imagens/${nomeArquivo}`;
};

  const imageSrc = getImageUrl(products.fotoUrl);

  // DEBUG: Log para verificar
  useEffect(() => {
    console.log("=== DEBUG IMAGEM ===");
    console.log("Produto:", products.name);
    console.log("Foto URL do banco:", products.fotoUrl);
    console.log("URL construída:", imageSrc);
    
    // Testa se a imagem carrega
    if (products.fotoUrl) {
      const img = new Image();
      img.onload = () => console.log("✅ Teste: Imagem carrega OK");
      img.onerror = () => console.log("❌ Teste: Imagem NÃO carrega");
      img.src = imageSrc;
    }
  }, [products, imageSrc]);

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
            src={imageError ? "/placeholder.png" : imageSrc}
            alt={products.name}
            className={styles.cardImage}
            onError={(e) => {
              console.error("❌ Erro ao carregar imagem:", imageSrc);
              setImageError(true);
              e.currentTarget.src = "/placeholder.png";
              
              // Tenta alternativa
              if (products.fotoUrl && !products.fotoUrl.startsWith('/imagens/')) {
                const altUrl = `${API_URL}/imagens/${products.fotoUrl}`;
                console.log("🔄 Tentando URL alternativa:", altUrl);
                e.currentTarget.src = altUrl;
              }
            }}
            onLoad={() => {
              console.log("✅ Imagem carregada com sucesso:", imageSrc);
              setImageError(false);
            }}
          />
          {isMobile && (
            <div className={styles.mobileOverlay}>
              <InfoIcon size={20} className={styles.infoIcon} />
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
                  src={imageError ? "/placeholder.png" : imageSrc}
                  alt={products.name}
                  className={styles.sidebarImg}
                  onError={() => setImageError(true)}
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