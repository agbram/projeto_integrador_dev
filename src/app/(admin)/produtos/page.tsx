"use client";

import React, { useEffect, useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { UserPlusIcon } from "@phosphor-icons/react";
import CardProduto from "@/components/Cards/CardProduto";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import { usePageActions } from "@/hooks/usePageActions"
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import fileToBase64 from "@/utils/fileToBase64";
import Product from "@/models/Product";

// OPERAÇÕES PRINCIPAIS:

// CADASTRAR PRODUTO:
// 1. Coleta dados do formulário
// 2. Converte imagem para base64
// 3. Envia POST para /products
// 4. Atualiza lista de produtos

// EDITAR PRODUTO:
// 1. Busca produto selecionado
// 2. Preenche formulário com dados atuais
// 3. Envia PUT para /products/:id
// 4. Atualiza lista localmente

// DESATIVAR PRODUTO:
// 1. Abre modal de confirmação
// 2. Envia DELETE para /products/:id
// 3. Atualiza status do produto na lista
// 4. Mostra feedback de sucesso

// BUSCAR PRODUTOS:
// 1. Faz GET para /products
// 2. Atualiza estado local com lista
// 3. Trata erros de carregamento

// CONVERSÃO DE IMAGEM:
// 1. Recebe arquivo do input
// 2. Converte para base64
// 3. Envia no payload da API

// GERENCIAMENTO DE MODAIS:
// - Modal principal: Cadastro
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
  const pageAction = usePageActions();

  const handleCloseEditModal = () => {
    setModalEditShow(false);
    setSelectProduto(undefined);
  };

  const handleWarningDelete = () => {
    setModalEditShow(false);
    setWarningDeleteModalShow(true);
    setWarningMessage("Deseja realmente desativar esse produto?");
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
      setSuccessMessage("Produto desativado com sucesso!");
      setSuccessModalShow(true);
      setModalEditShow(false);
      fetchprodutos();
    } catch (error: any) {
      console.error("Erro ao desativar produto:", error);
      setWarningMessage(
        error.response?.data?.message || "Erro ao desativar cliente. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWarningModal = () => {
    setModalEditShow(true);
    setWarningDeleteModalShow(false);
  };

  const handleSalvarAlteracoes = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description,
        costPrice: Number(data.costPrice),
        markupPercent: Number(data.markupPercent),
        stockQuantity: Number(data.stockQuantity),
        fotoData: (data.fotoData != null) ? await fileToBase64(data.fotoData as File) : undefined,
        category: data.category,
        isActive: true,
      };

      console.log("Editando produto:", formattedData);
      const response = await api.put(`/products/${selectProduto?.id}`, formattedData);
      console.log("Produto alterado com sucesso:", response.data);

      // ✅ Atualizar a lista de clientes
      setProdutos(prev => prev.map(produto =>
        produto.id === selectProduto?.id ? response.data : produto
      ));

      setSuccessMessage("Produto atualizado com sucesso!");
      setSuccessModalShow(true);
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao editar cliente:", error);
      setWarningMessage(
        error.response?.data?.message || "Erro ao editar produto. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // registra o handler apenas quando o componente montar (ou quando pageAction mudar)
    pageAction.setHandleAdd(() => {
      setModalShow(true);

    });
    // opcional: cleanup para restaurar handler padrão (não obrigatório)
    return () => {
      pageAction.setHandleAdd(() => () => { }); // no-op ao desmontar
    };
  }, []);

  const categoryOptions = [
    { value: "BOLOS", label: "BOLOS" },
    { value: "DOCINHOS", label: "DOCINHOS" },
  ];

  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const formattedData = {
        name: data.name,
        description: data.description,
        costPrice: Number(data.costPrice),
        markupPercent: Number(data.markupPercent),
        stockQuantity: Number(data.stockQuantity),
        fotoData: (data.fotoData != null) ? await fileToBase64(data.fotoData as File) : undefined,
        category: data.category,
        isActive: true,
      };

      const response = await api.post("/products", formattedData);
      console.log("Produto cadastrado:", response.data);
      fetchprodutos();

      setSuccessModalShow(true);
      setModalShow(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar Produto:", error);
      setWarningMessage("Erro ao cadastrar Produto. Tente novamente.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchprodutos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar Produto:", error);
      setWarningMessage("Erro ao carregar os Produto cadastrados.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchprodutos();
  }, []);

  return (
    <>
      <div className={styles.containerPrincipal}>
        {produtos.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Nenhum Produto encontrado</h3>
            <p>Cadastre seu produto cliente para começar</p>
          </div>
        ) : (
          produtos.map((produto) => (
            <div
              key={produto.id}
              className={styles.divContainerCliente}
            >
              <CardProduto
                title={produto.name}
                products={produto}
                loading={loading}
                actions={[
                  {
                    label: "Editar",
                    onClick: () => {
                      setSelectProduto(produto);
                      setModalEditShow(true);
                    },
                  },
                ]}
              />
            </div>
          ))
        )}
      </div>
      {/* Modal principal */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        centered
        className={styles.modalProdutos}
      >
        <Modal.Header closeButton className={styles.modalProdutosHeader}>
          <Modal.Title className={styles.modalProdutosTitle}>Cadastro de Produtos</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalProdutosBody}>
          <Card
            title=""
            fields={[
              { name: "name", label: "Nome" },
              { name: "description", label: "Descrição" },
              { name: "costPrice", label: "Preço de custo" },
              { name: "markupPercent", label: "Percentual de Markup" },
              { name: "fotoData", label: "Imagem", type: "file" },
              {
                name: "category",
                label: "Categoria",
                type: "select",
                options: categoryOptions,
              },
            ]}
            onSubmit={handleSubmit}
            submitLabel="Cadastrar"
            loading={loading}
            showCancel
            onCancel={() => setModalShow(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        show={modalEditShow}
        onHide={handleCloseEditModal}
        centered
        size="lg"
        className={styles.modalProdutos}
      >
        <Modal.Header closeButton className={styles.modalProdutosHeader}>
          <Modal.Title className={styles.modalProdutosTitle}>Editar Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBodyEdit}>
          <Card
            key={selectProduto?.id}
            title=""
            fields={[
              { name: "name", value: selectProduto?.name.toString(), label: "Nome" },
              { name: "description", value: selectProduto?.description.toString(), label: "Descrição" },
              { name: "costPrice", value: selectProduto?.costPrice.toString(), label: "Preço de custo" },
              { name: "markupPercent", value: selectProduto?.markupPercent.toString(), label: "Percentual de Markup" },
              { name: "fotoData", label: "Alterar imagem atual", type: "file" },
              {
                name: "category",
                label: "Tipo do Produto",
                type: "select",
                options: categoryOptions,
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
        </Modal.Body>
      </Modal>

      {/* Modal de sucesso */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        centered
        className={styles.successProdutosModal}
      >
        <Modal.Body className={styles.successProdutosBody}>
          <div className={styles.successProdutosIconContainer} aria-hidden>
            <span className={styles.successProdutosIcon}>✓</span>
          </div>
          <h5 className={styles.successProdutosTitle}>
            Produto cadastrado com sucesso!
          </h5>
        </Modal.Body>
        <Modal.Footer className={styles.successProdutosFooter}>
          <button
            className={styles.successProdutosButton}
            onClick={() => setSuccessModalShow(false)}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal de alerta de delete */}
      <Modal
        show={warningDeleteModalShow}
        onHide={() => setWarningDeleteModalShow(false)}
        size="sm"
        centered
        className={styles.warningProdutosModal}
      >
        <Modal.Body className={styles.warningProdutosBody}>
          <div className={styles.warningProdutosIconContainer} aria-hidden>
            <span className={styles.warningProdutosIcon}>⚠</span>
          </div>
          <h5 className={styles.warningProdutosTitle}>Confirmação</h5>
          <p className={styles.warningProdutosMessage}>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={handleCloseWarningModal} CancelLabel="Cancelar" />
          <Button variant="danger" onClick={handleDesativaProduct} className={styles.warningProdutosButton}>
            Desativar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de aviso */}
      <Modal
        show={warningModalShow}
        onHide={() => setWarningModalShow(false)}
        size="sm"
        centered
        className={styles.warningProdutosModal}
      >
        <Modal.Body className={styles.warningProdutosBody}>
          <div className={styles.warningProdutosIconContainer} aria-hidden>
            <span className={styles.warningProdutosIcon}>⚠</span>
          </div>
          <h5 className={styles.warningProdutosTitle}>Atenção</h5>
          <p className={styles.warningProdutosMessage}>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.warningProdutosFooter}>
          <button
            className={styles.warningProdutosButton}
            onClick={() => setWarningModalShow(false)}
          >
            Entendi
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
