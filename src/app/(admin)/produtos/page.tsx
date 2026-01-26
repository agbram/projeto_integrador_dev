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

// OPERAÇÕES PRINCIPAIS:

// CADASTRAR PRODUTO:
// 1. Coleta dados básicos do formulário
// 2. Converte imagem para base64
// 3. Envia POST para /products (sem preço)
// 4. Produto é criado com status NOT_CALCULATED
// 5. Usuário deve ir para precificação para adicionar ingredientes

// EDITAR PRODUTO:
// 1. Busca produto selecionado
// 2. Preenche formulário com dados atuais
// 3. Envia PUT para /products/:id
// 4. Não inclui campos de preço (agora é automático)

// DESATIVAR PRODUTO:
// 1. Abre modal de confirmação
// 2. Envia DELETE para /products/:id
// 3. Atualiza status do produto na lista

// GERENCIAMENTO DE MODAIS:
// - Modal principal: Cadastro básico
// - Modal edição: Alteração de dados
// - Modal sucesso: Feedback positivo
// - Modal alerta: Erros e confirmações

export default function ProdutosModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [selectProduto, setSelectProduto] = useState<Product>();
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const pageActions = useContext(PageActions);
  
  const API_URL = "http://localhost:4000"; // URL do backend

const getImageUrl = (fotoUrl: string | undefined | null): string => {
  if (!fotoUrl) {
    return "/placeholder.png";
  }

  console.log("📸 Foto URL do banco (ProdutosModal):", fotoUrl);

  // Se já tem http (de algum teste)
  if (fotoUrl.includes('http://') || fotoUrl.includes('https://')) {
    // Corrige porta 3000 para 4000
    return fotoUrl.replace('localhost:3000', 'localhost:4000').replace(':3000', ':4000');
  }

  // Remove qualquer prefixo /imagens/ se existir
  const nomeArquivo = fotoUrl.replace(/^\/?imagens\//, '');
  
  // Retorna URL completa
  return `${API_URL}/imagens/${nomeArquivo}`;
};
  useEffect(() => {
    pageActions.setShowAddButton(true);
  }, []);

  // Categorias disponíveis (do enum Category do Prisma)
  const categoryOptions = [
    { value: "BOLOS", label: "BOLOS" },
    { value: "DOCINHOS", label: "DOCINHOS" },
  ];

  // Buscar produtos
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setWarningMessage("Erro ao carregar os produtos cadastrados.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Configurar botão de adicionar
  useEffect(() => {
    pageActions.setHandleAdd(() => {
      setModalShow(true);
    });
    
    return () => {
      pageActions.setHandleAdd(() => () => {});
    };
  }, []);

  // CADASTRO DE NOVO PRODUTO
  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Preparar dados para envio (SEM campos de preço)
      const formattedData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        isActive: true,
        // Campos opcionais da precificação
        weight: data.weight ? parseFloat(data.weight.toString()) : null,
        yield: data.yield ? parseFloat(data.yield.toString()) : null,
        // Imagem (opcional)
        fotoData: data.fotoData ? await fileToBase64(data.fotoData as File) : undefined,
      };

      const response = await api.post("/products", formattedData);
      console.log("Produto cadastrado:", response.data);
      
      // Atualizar lista
      await fetchProdutos();
      
      // Mensagem informativa sobre o próximo passo
      setSuccessMessage("Produto cadastrado com sucesso! Agora vá para a página de Precificação para adicionar ingredientes e calcular o preço.");
      setSuccessModalShow(true);
      setModalShow(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      setWarningMessage(
        error.response?.data?.error || "Erro ao cadastrar produto. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // EDIÇÃO DE PRODUTO
  const handleSalvarAlteracoes = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        isActive: true,
        // Campos opcionais da precificação
        weight: data.weight ? parseFloat(data.weight) : null,
        yield: data.yield ? parseFloat(data.yield) : null,
        // Imagem (opcional - só envia se foi alterada)
        fotoData: data.fotoData ? await fileToBase64(data.fotoData as File) : undefined,
      };

      console.log("Editando produto:", formattedData);
      const response = await api.put(`/products/${selectProduto?.id}`, formattedData);
      console.log("Produto alterado com sucesso:", response.data);

      // Atualizar lista local
      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));

      setSuccessMessage("Produto atualizado com sucesso!");
      setSuccessModalShow(true);
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao editar produto:", error);
      setWarningMessage(
        error.response?.data?.error || "Erro ao editar produto. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // DESATIVAÇÃO DE PRODUTO
  const handleWarningDelete = () => {
    setModalEditShow(false);
    setWarningDeleteModalShow(true);
    setWarningMessage("Deseja realmente desativar este produto?");
  };

  const handleDesativaProduct = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/products/${selectProduto?.id}`);
      console.log("Produto desativado com sucesso:", response.data);

      // Atualizar lista local
      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));
      
      setWarningDeleteModalShow(false);
      setSuccessMessage("Produto desativado com sucesso!");
      setSuccessModalShow(true);
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao desativar produto:", error);
      setWarningMessage(
        error.response?.data?.error || "Erro ao desativar produto. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Fechar modais
  const handleCloseEditModal = () => {
    setModalEditShow(false);
    setSelectProduto(undefined);
  };

  const handleCloseWarningModal = () => {
    setModalEditShow(true);
    setWarningDeleteModalShow(false);
  };

  // Navegar para página de precificação
  const goToPricing = (productId: number) => {
    window.location.href = `/precificacao?produto=${productId}`;
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {produtos.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Nenhum produto encontrado</h3>
            <p>Cadastre seu primeiro produto para começar</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {produtos.map((produto) => (
              <div key={produto.id} className={styles.productCard}>
                <div className={styles.productCardHeader}>
                  {produto.fotoUrl && (
                    <img 
                      src={getImageUrl(produto.fotoUrl)} 
                      alt={produto.name} 
                      className={styles.productImage}
                      onError={(e) => {
                        console.error("❌ Erro ao carregar imagem:", produto.fotoUrl);
                        e.currentTarget.src = "/placeholder.png";
                      }}
                      onLoad={() => console.log("✅ Imagem carregada:", produto.name)}
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
                    {produto.weight && <span>Peso: {produto.weight}kg</span>}
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
      >
        <Modal.Header closeButton className={styles.modalProdutosHeader}>
          <Modal.Title className={styles.modalProdutosTitle}>
            Cadastro de Produto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalProdutosBody}>
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
              { 
                name: "name", 
                label: "Nome do Produto *", 
                placeholder: "Ex: Bolo de Chocolate"
              },
              { 
                name: "description", 
                label: "Descrição",
                placeholder: "Descrição detalhada do produto",
                type: "textarea"
              },
              {
                name: "category",
                label: "Categoria *",
                type: "select",
                options: categoryOptions,
              },
              { 
                name: "weight",
                label: "Peso (kg)",
                type: "number",
                step: "0.01",
                placeholder: "Ex: 1.5 para 1,5kg",
              },
              { 
                name: "yield",
                label: "Rendimento (unidades)",
                type: "number",
                step: "1",
                placeholder: "Ex: 10 unidades",
              },
              { 
                name: "fotoData", 
                label: "Imagem do Produto", 
                type: "file",
              },
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
      >
        <Modal.Header closeButton className={styles.modalProdutosHeader}>
          <Modal.Title className={styles.modalProdutosTitle}>
            Editar Produto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBodyEdit}>
          {selectProduto && (
            <>
              <div className={styles.productStatusInfo}>
                <p>
                  <strong>Status de precificação:</strong> 
                  <span className={`${styles.statusBadge} ${
                    selectProduto.priceStatus === 'CALCULATED' ? styles.calculated : styles.pending
                  }`}>
                    {selectProduto.priceStatus === 'CALCULATED' 
                      ? 'Preço calculado' 
                      : 'Aguardando precificação'}
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
                  { 
                    name: "name", 
                    label: "Nome do Produto *", 
                    value: selectProduto?.name || "",
                    placeholder: "Nome do produto"
                  },
                  { 
                    name: "description", 
                    label: "Descrição",
                    value: selectProduto?.description || "",
                    placeholder: "Descrição do produto",
                    type: "textarea"
                  },
                  {
                    name: "category",
                    label: "Categoria *",
                    type: "select",
                    options: categoryOptions,
                    value: selectProduto?.category || "BOLOS",
                  },
                  { 
                    name: "weight",
                    label: "Peso (kg)",
                    type: "number",
                    step: "0.01",
                    value: selectProduto?.weight?.toString() || "",
                    placeholder: "Ex: 1.5"
                  },
                  { 
                    name: "yield",
                    label: "Rendimento (unidades)",
                    type: "number",
                    step: "1",
                    value: selectProduto?.yield?.toString() || "",
                    placeholder: "Ex: 10"
                  },
                  { 
                    name: "fotoData", 
                    label: "Alterar imagem", 
                    type: "file",
                  },
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

      {/* MODAL DE SUCESSO */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="lg"
        centered
        className={styles.successModal}
      >
        <Modal.Body className={styles.successBody}>
          <div className={styles.successIcon}>✓</div>
          <h5>Sucesso!</h5>
          <p>{successMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.successFooter}>
          <button
            className={styles.successButton}
            onClick={() => setSuccessModalShow(false)}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO DE DESATIVAÇÃO */}
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
          <p>{warningMessage}</p>
          <p className={styles.warningNote}>
            <small>
              <strong>Atenção:</strong> Desativar um produto não remove seus dados, 
              apenas o torna indisponível para novos pedidos.
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar 
            variant="outline" 
            onClick={handleCloseWarningModal} 
            CancelLabel="Cancelar" 
          />
          <Button 
            variant="danger" 
            onClick={handleDesativaProduct} 
            className={styles.warningButton}
            disabled={loading}
          >
            {loading ? "Processando..." : "Desativar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE ERRO/ALERTA */}
      <Modal
        show={warningModalShow}
        onHide={() => setWarningModalShow(false)}
        size="sm"
        centered
        className={styles.warningModal}
      >
        <Modal.Body className={styles.warningBody}>
          <div className={styles.warningIcon}>⚠</div>
          <h5>Atenção</h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.warningFooter}>
          <button
            className={styles.warningButton}
            onClick={() => setWarningModalShow(false)}
          >
            Entendi
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}