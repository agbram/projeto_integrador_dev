"use client";

import React, { useContext, useEffect, useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "@/services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import fileToBase64 from "@/utils/fileToBase64";
import Product from "@/models/Product";
import { PageActions } from "@/contexts/PageActions";
import { CalculatorIcon, ImagesIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import toast from "react-hot-toast"; // <-- importação adicionada
export default function ProdutosPage() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [selectProduto, setSelectProduto] = useState<Product>();
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const [draftProduct, setDraftProduct] = useState<any>({});
  const { 
    setShowAddButton, 
    setHandleAdd, 
    setShowFilterButton, 
    setFilterOptions, 
    setHandleFilter,
    searchQuery,
    setSearchQuery 
  } = useContext(PageActions);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getImageUrl = (fotoUrl: string | undefined | null): string => {
    if (!fotoUrl) {
      return 'https://via.placeholder.com/150?text=Sem+imagem';
    }
    if (fotoUrl.startsWith('http')) {
      return fotoUrl;
    }
    const nomeArquivo = fotoUrl.replace(/^.*[\\\/]/, '');
    return `${API_BASE_URL}/imagens/${nomeArquivo}`;
  };

  // Computa a lista filtrada
  const produtosFiltrados = produtos.filter((p) => {
    // 1. Filtro de Texto (Busca)
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Filtro de Categoria/Status
    if (activeFilter === "disabled") return p.isActive === false;
    if (activeFilter === "calculated") return p.isActive !== false && p.priceStatus === "CALCULATED";
    if (activeFilter === "not_calculated") return p.isActive !== false && p.priceStatus !== "CALCULATED";
    if (activeFilter === "BOLOS") return p.isActive !== false && p.category === "BOLOS";
    if (activeFilter === "DOCINHOS") return p.isActive !== false && p.category === "DOCINHOS";
    
    // "all" — só ativos
    return p.isActive !== false;
  });

  useEffect(() => {
    setShowAddButton(true);
    setHandleAdd(() => { 
      setDraftProduct({
        category: 'BOLOS',
        yield: ''
      });
      setModalShow(true); 
    });

    setShowFilterButton(true);
    setFilterOptions([
      { label: "Todos", value: "all" },
      { label: "Bolos", value: "BOLOS" },
      { label: "Docinhos", value: "DOCINHOS" },
      { label: "Precificados", value: "calculated" },
      { label: "Não Precificados", value: "not_calculated" },
      { label: "Desativados", value: "disabled" },
    ]);
    setHandleFilter((value: string) => {
      setActiveFilter(value);
    });

    return () => {
      setShowFilterButton(false);
      setFilterOptions([]);
      setSearchQuery("");
      setHandleAdd(() => () => {});
    };
  }, []);

  const categoryOptions = [
    { value: "BOLOS", label: "BOLOS" },
    { value: "DOCINHOS", label: "DOCINHOS" },
  ];

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProdutos(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para visualizar Produtos.", { id: "page_error" });
      } else {
        toast.error("Erro ao carregar os produtos cadastrados.", { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
    return () => {
      toast.dismiss("page_error");
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedData = {
        name: draftProduct.name,
        description: draftProduct.description || null,
        category: draftProduct.category,
        isActive: true,
        yield: draftProduct.yield ? parseFloat(draftProduct.yield.toString()) : null,
        fotoData: draftProduct.fotoData ? await fileToBase64(draftProduct.fotoData as File) : undefined,
      };

      const response = await api.post("/products", formattedData);
      console.log("Produto cadastrado:", response.data);
      await fetchProdutos();

      toast.success("Produto cadastrado com sucesso! Agora vá para a página de Precificação para adicionar ingredientes e calcular o preço.");
      setModalShow(false);
      setDraftProduct({});
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error(error.response?.data?.error || "Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAlteracoes = async () => {
    setLoading(true);
    try {
      const formattedData = {
        name: draftProduct.name,
        description: draftProduct.description || null,
        category: draftProduct.category,
        isActive: true,
        yield: (draftProduct.yield !== "" && draftProduct.yield !== null && draftProduct.yield !== undefined) ? Number(draftProduct.yield) : null,
        fotoData: draftProduct.fotoData ? await fileToBase64(draftProduct.fotoData as File) : undefined,
      };

      console.log("Editando produto:", formattedData);
      const response = await api.put(`/products/${selectProduto?.id}`, formattedData);
      console.log("Produto alterado com sucesso:", response.data);

      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));

      toast.success("Produto atualizado com sucesso!");
      setModalEditShow(false);
      setDraftProduct({});
    } catch (error: any) {
      console.error("Erro ao editar produto:", error);
      toast.error(error.response?.data?.error || "Erro ao editar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleWarningDelete = () => {
    setModalEditShow(false);
    setWarningDeleteModalShow(true);
    // Mensagem fixa no modal, não precisa de estado
  };

  const handleDesativaProduct = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/products/${selectProduto?.id}`);
      console.log("Produto desativado com sucesso:", response.data);

      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));

      setWarningDeleteModalShow(false);
      toast.success("Produto desativado com sucesso!");
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao desativar produto:", error);
      toast.error(error.response?.data?.error || "Erro ao desativar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setModalEditShow(false);
    setSelectProduto(undefined);
  };

  const handleCloseWarningModal = () => {
    setModalEditShow(true);
    setWarningDeleteModalShow(false);
  };

  const goToPricing = (productId: number) => {
    window.location.href = `/precificacao?produto=${productId}`;
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {produtosFiltrados.length === 0 ? (
          <div className="emptyStateStandard">
            <h3>
              {activeFilter === "disabled"
                ? "Nenhum produto desativado"
                : activeFilter !== "all"
                ? "Nenhum produto encontrado para este filtro"
                : "Nenhum produto encontrado"}
            </h3>
            <p>
              {activeFilter === "all"
                ? "Cadastre seu primeiro produto para começar"
                : "Tente outro filtro"}
            </p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className={styles.productCard}>
                <div className={styles.productCardHeader}>
                  <div className={styles.categoryBadge}>{produto.category}</div>
                  
                  <span className={`${styles.priceStatusBadge} ${
                    produto.priceStatus === 'CALCULATED' ? styles.calculated : styles.notCalculated
                  }`}>
                    {produto.priceStatus === 'CALCULATED' ? '✓ Precificado' : '⚡ Precificar'}
                  </span>

                  <div className={styles.productImageContainer}>
                    {produto.fotoUrl ? (
                      <img
                        src={getImageUrl(produto.fotoUrl)}
                        alt={produto.name}
                        className={styles.productImage}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Indisponível';
                        }}
                      />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <ImagesIcon size={48} weight="light" />
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.productCardBody}>
                  <h4>{produto.name}</h4>
                  <p className={styles.productDescription}>{produto.description || "Sem descrição disponível para este produto."}</p>
                  
                  <div className={styles.priceInfoContainer}>
                    {produto.priceStatus === 'CALCULATED' ? (
                      <div className={styles.priceGrid}>
                        <div className={styles.priceBox}>
                          <span className={styles.priceLabel}>Custo</span>
                          <span className={styles.priceValue}>R$ {produto.costPrice?.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className={styles.priceBox}>
                          <span className={styles.priceLabel}>Venda</span>
                          <span className={`${styles.priceValue} ${styles.salePriceValue}`}>R$ {produto.salePrice?.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.notCalculatedPlaceholder}>
                        Aguardando precificação...
                      </div>
                    )}
                    
                    <span className={styles.productYield}>
                      Rendimento: {produto.yield && produto.yield > 0 
                        ? `${produto.yield} ${produto.category === 'DOCINHOS' ? 'unidades' : 'porção'}`
                        : "Indefinido"
                      }
                    </span>
                  </div>
                </div>
                
                <div className={styles.productCardFooter}>
                  <button
                    className={`${styles.btnAction} ${styles.btnEditar}`}
                    onClick={() => {
                      setSelectProduto(produto);
                      setDraftProduct({
                        name: produto.name,
                        description: produto.description,
                        category: produto.category,
                        yield: produto.yield?.toString(),
                      });
                      setModalEditShow(true);
                    }}
                  >
                    <PencilSimpleIcon size={18} />
                    Editar
                  </button>
                  
                  <button
                    className={`${styles.btnAction} ${styles.btnPrecificar} ${
                      produto.priceStatus === 'CALCULATED' ? styles.btnRecalcular : ''
                    }`}
                    onClick={() => goToPricing(produto.id)}
                  >
                    <CalculatorIcon size={18} weight="bold" />
                    {produto.priceStatus === 'CALCULATED' ? 'Recalcular' : 'Precificar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="xl"
        centered
        className={styles.modalProdutos}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body style={{ padding: 0 }}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>Cadastro de Produto</h2>
            <p className={styles.stepSubtitle}>Informe os dados básicos para iniciar a precificação do produto</p>
          </div>

          <div className={styles.splitLayout}>
            {/* Painel Esquerdo: Instruções e Identificação */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h5>1. Identificação</h5>
              </div>
              <div className={styles.panelContent}>
                <div className={styles.instructionBox}>
                  <p><strong>Como funciona:</strong></p>
                  <ol>
                    <li>Cadastre os dados básicos primeiro</li>
                    <li>O produto iniciará como "Para Precificar"</li>
                    <li>Adicione ingredientes na Matriz de Precificação</li>
                    <li>O sistema calculará o preço final automaticamente</li>
                  </ol>
                </div>
                
                <Card
                  title=""
                  fields={[
                    { name: "name", label: "Nome do Produto", placeholder: "Ex: Bolo de Chocolate" },
                    { name: "description", label: "Descrição Curta", placeholder: "Breve descrição do produto", type: "textarea" },
                  ]}
                  showSubmit={false}
                  showCancel={false}
                  onChange={(name, value) => setDraftProduct((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>

            {/* Painel Direito: Configurações e Imagem */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h5>2. Detalhes Técnicos</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  title=""
                  fields={[
                    { name: "category", label: "Categoria do Produto", type: "select", options: categoryOptions },
                    { name: "yield", label: "Rendimento Estimado", type: "number", step: "1", placeholder: "Ex: 10 unidades" },
                    { name: "fotoData", label: "Imagem (Opcional)", type: "file" },
                  ]}
                  onSubmit={handleSubmit}
                  submitLabel="Finalizar Cadastro"
                  loading={loading}
                  showCancel={false}
                  onChange={(name, value) => setDraftProduct((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnActionBack} onClick={() => setModalShow(false)}>
              Cancelar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        show={modalEditShow}
        onHide={handleCloseEditModal}
        centered
        size="xl"
        className={styles.modalProdutos}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body style={{ padding: 0 }}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>Editar Produto</h2>
            <p className={styles.stepSubtitle}>Atualize as informações técnicas ou imagem do produto selecionado</p>
          </div>

          <div className={styles.splitLayout}>
            {/* Painel Esquerdo: Identificação */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h5>Identificação</h5>
              </div>
              <div className={styles.panelContent}>
                {selectProduto && (
                   <div className={styles.productStatusInfo}>
                    <p>
                      <strong>Status:</strong> 
                      <span className={`${styles.statusBadge} ${
                        selectProduto.priceStatus === 'CALCULATED' ? styles.calculated : styles.pending
                      }`}>
                        {selectProduto.priceStatus === 'CALCULATED' ? 'Precificado' : 'Aguardando precificação'}
                      </span>
                    </p>
                    
                    {selectProduto.priceStatus === 'CALCULATED' && (
                      <div className={styles.currentPriceInfo}>
                        <p>Venda <strong>R$ {selectProduto.salePrice?.toFixed(2)}</strong></p>
                        <p>Custo <strong>R$ {selectProduto.costPrice?.toFixed(2)}</strong></p>
                        
                        <button 
                          className={styles.btnGoToPricing}
                          onClick={() => {
                            handleCloseEditModal();
                            goToPricing(selectProduto.id);
                          }}
                        >
                          <CalculatorIcon size={16} weight="bold" />
                          Ver Matriz de Precificação
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <Card
                  key={`edit-left-${selectProduto?.id}`}
                  title=""
                  fields={[
                    { name: "name", label: "Nome do Produto", value: selectProduto?.name || "", placeholder: "Nome do produto" },
                    { name: "description", label: "Descrição", value: selectProduto?.description || "", placeholder: "Descrição do produto", type: "textarea" },
                  ]}
                  showSubmit={false}
                  showCancel={false}
                  onChange={(name, value) => setDraftProduct((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>

            {/* Painel Direito: Configurações */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h5>Configurações Técnicas</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  key={`edit-right-${selectProduto?.id}`}
                  title=""
                  fields={[
                    { name: "category", label: "Categoria", type: "select", options: categoryOptions, value: selectProduto?.category || "BOLOS" },
                    { name: "yield", label: "Rendimento (unidades)", type: "number", step: "1", value: selectProduto?.yield?.toString() || "", placeholder: "Ex: 10" },
                    { name: "fotoData", label: "Alterar imagem do produto", type: "file" },
                  ]}
                  showDelete
                  onDelete={handleWarningDelete}
                  onSubmit={handleSalvarAlteracoes}
                  submitLabel="Salvar Alterações"
                  loading={loading}
                  onChange={(name, value) => setDraftProduct((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnActionBack} onClick={handleCloseEditModal}>
              Voltar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DE DESATIVAÇÃO (mantido) */}
      <Modal
        show={warningDeleteModalShow}
        onHide={() => setWarningDeleteModalShow(false)}
        size="sm"
        centered
        className={styles.warningModal}
      >
        <Modal.Body className={styles.warningBody}>
          <div className={styles.warningIcon}>⚠</div>
          <h5>Confirmar Desativação</h5>
          <p>Deseja realmente desativar este produto?</p>
          <p className={styles.warningNote}>
            <small>
              <strong>Atenção:</strong> Desativar um produto não remove seus dados, 
              apenas o torna indisponível para novos pedidos.
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={handleCloseWarningModal} CancelLabel="Cancelar" />
          <Button variant="danger" onClick={handleDesativaProduct} className={styles.warningButton} disabled={loading}>
            {loading ? "Processando..." : "Desativar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAIS DE SUCESSO E ERRO FORAM REMOVIDOS */}
    </>
  );
}