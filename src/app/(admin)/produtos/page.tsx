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
import { CalculatorIcon } from "@phosphor-icons/react";
import toast from "react-hot-toast"; // <-- importação adicionada
export default function ProdutosPage() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [selectProduto, setSelectProduto] = useState<Product>();
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const { setShowAddButton, setHandleAdd, setShowFilterButton, setFilterOptions, setHandleFilter } = useContext(PageActions);
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
    setHandleAdd(() => { setModalShow(true); });

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

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        isActive: true,
        yield: data.yield ? parseFloat(data.yield.toString()) : null,
        fotoData: data.fotoData ? await fileToBase64(data.fotoData as File) : undefined,
      };

      const response = await api.post("/products", formattedData);
      console.log("Produto cadastrado:", response.data);
      await fetchProdutos();

      toast.success("Produto cadastrado com sucesso! Agora vá para a página de Precificação para adicionar ingredientes e calcular o preço.");
      setModalShow(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error(error.response?.data?.error || "Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAlteracoes = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        isActive: true,
        yield: data.yield ? parseFloat(data.yield) : null,
        fotoData: data.fotoData ? await fileToBase64(data.fotoData as File) : undefined,
      };

      console.log("Editando produto:", formattedData);
      const response = await api.put(`/products/${selectProduto?.id}`, formattedData);
      console.log("Produto alterado com sucesso:", response.data);

      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));

      toast.success("Produto atualizado com sucesso!");
      setModalEditShow(false);
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
                  {produto.fotoUrl && (
                    <img
                      src={getImageUrl(produto.fotoUrl)}
                      alt={produto.name}
                      className={styles.productImage}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Erro';
                      }}
                    />
                  )}
                  <h4>{produto.name}</h4>
                  <span className={`${styles.priceStatusBadge} ${
                    produto.priceStatus === 'CALCULATED' ? styles.calculated : styles.notCalculated
                  }`}>
                    {produto.priceStatus === 'CALCULATED' ? '✓ Preço calculado' : '⚡ Precificar'}
                  </span>
                </div>
                
                <div className={styles.productCardBody}>
                  <p className={styles.productCategory}>{produto.category}</p>
                  <p className={styles.productDescription}>{produto.description}</p>
                  
                  {produto.priceStatus === 'CALCULATED' && (
                    <div className={styles.priceInfo}>
                      <div className={styles.priceItem}>
                        <span>Custo:</span>
                        <strong>R$ {produto.costPrice?.toFixed(2) || '0,00'}</strong>
                      </div>
                      <div className={styles.priceItem}>
                        <span>Venda:</span>
                        <strong className={styles.salePrice}>
                          R$ {produto.salePrice?.toFixed(2) || '0,00'}
                        </strong>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.productInfo}>
                    {produto.yield && <span>Rendimento: {produto.yield} un</span>}
                  </div>
                </div>
                
                <div className={styles.productCardFooter}>
                  <button
                    className={styles.btnEditar}
                    onClick={() => {
                      setSelectProduto(produto);
                      setModalEditShow(true);
                    }}
                  >
                    Editar
                  </button>
                  
                  <button
                    className={`${styles.btnPrecificar} ${
                      produto.priceStatus === 'CALCULATED' ? styles.btnRecalcular : ''
                    }`}
                    onClick={() => goToPricing(produto.id)}
                  >
                    <CalculatorIcon size={16} />
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
        size="lg"
        centered
        className={styles.modalProdutos}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body className={styles.modalProdutosBody}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>Cadastro de Produto</h2>
          <div className={styles.instructionBox}>
            <p><strong>Como funciona o cadastro:</strong></p>
            <ol>
              <li>Cadastre os dados básicos do produto</li>
              <li>O produto será criado sem preço (status: "Para Precificar")</li>
              <li>Na página de Precificação, adicione os ingredientes</li>
              <li>O sistema calculará automaticamente o custo e preço de venda</li>
            </ol>
          </div>
          
          <Card
            title=""
            fields={[
              { name: "name", label: "Nome do Produto *", placeholder: "Ex: Bolo de Chocolate" },
              { name: "description", label: "Descrição", placeholder: "Descrição detalhada do produto", type: "textarea" },
              { name: "category", label: "Categoria *", type: "select", options: categoryOptions },
              { name: "yield", label: "Rendimento (unidades)", type: "number", step: "1", placeholder: "Ex: 10 unidades" },
              { name: "fotoData", label: "Imagem do Produto", type: "file" },
            ]}
            onSubmit={handleSubmit}
            submitLabel="Cadastrar Produto"
            loading={loading}
            showCancel
            onCancel={() => setModalShow(false)}
          />
        </Modal.Body>
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        show={modalEditShow}
        onHide={handleCloseEditModal}
        centered
        size="lg"
        className={styles.modalProdutos}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body className={styles.modalBodyEdit}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>Editar Produto</h2>
          {selectProduto && (
            <>
              <div className={styles.productStatusInfo}>
                <p>
                  <strong>Status de precificação:</strong> 
                  <span className={`${styles.statusBadge} ${
                    selectProduto.priceStatus === 'CALCULATED' ? styles.calculated : styles.pending
                  }`}>
                    {selectProduto.priceStatus === 'CALCULATED' ? 'Preço calculado' : 'Aguardando precificação'}
                  </span>
                </p>
                
                {selectProduto.priceStatus === 'CALCULATED' && (
                  <div className={styles.currentPriceInfo}>
                    <p><strong>Preço atual:</strong> R$ {selectProduto.salePrice?.toFixed(2)}</p>
                    <p><strong>Custo atual:</strong> R$ {selectProduto.costPrice?.toFixed(2)}</p>
                    <button 
                      className={styles.btnGoToPricing}
                      onClick={() => {
                        handleCloseEditModal();
                        goToPricing(selectProduto.id);
                      }}
                    >
                      <CalculatorIcon size={16} />
                      Ir para Precificação
                    </button>
                  </div>
                )}
              </div>
              
              <Card
                key={selectProduto?.id}
                title=""
                fields={[
                  { name: "name", label: "Nome do Produto *", value: selectProduto?.name || "", placeholder: "Nome do produto" },
                  { name: "description", label: "Descrição", value: selectProduto?.description || "", placeholder: "Descrição do produto", type: "textarea" },
                  { name: "category", label: "Categoria *", type: "select", options: categoryOptions, value: selectProduto?.category || "BOLOS" },
                  { name: "yield", label: "Rendimento (unidades)", type: "number", step: "1", value: selectProduto?.yield?.toString() || "", placeholder: "Ex: 10" },
                  { name: "fotoData", label: "Alterar imagem", type: "file" },
                ]}
                showDelete
                onDelete={handleWarningDelete}
                showCancel
                onCancel={handleCloseEditModal}
                onSubmit={handleSalvarAlteracoes}
                submitLabel="Salvar Alterações"
                loading={loading}
              />
            </>
          )}
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