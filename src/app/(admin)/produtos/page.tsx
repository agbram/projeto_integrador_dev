"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { UserPlusIcon } from "@phosphor-icons/react";
import CardProduto from "@/components/Cards/CardProduto";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";

export default function ProdutosModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [produtos, setprodutos] = useState<Product[]>([]);
  const [selectProduto, setSelectProduto] = useState<Product>();

  const categoryOptions = [
    { value: "BOLOS", label: "BOLOS" },
    { value: "DOCINHOS", label: "DOCINHOS" },
  ];

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description,
        costPrice: Number(data.costPrice),
        markupPercent: Number(data.markupPercent),
        stockQuantity: Number(data.stockQuantity),
        fotoData: data.fotoUrl,
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
      setprodutos(response.data);
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
      <div>
        {produtos.map((produto) => (
          <div
            key={produto.id}
            style={{ position: "relative", marginBottom: "20px" }}
          >
            <CardProduto
              title={`produto: ${produto.name}`}
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
        ))}
      </div>

      {/* Modal principal */}
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
        size="lg"
        centered
        className={styles.modalProdutos} /* root específico para este modal */
      >
        <Modal.Body className={styles.modalProdutosBody}>
          <Card
            title="Cadastro de Produtos"
            fields={[
              { name: "name", label: "Nome" },
              { name: "description", label: "Descrição" },
              { name: "costPrice", label: "Preço de custo" },
              { name: "markupPercent", label: "Percentual de Markup" },
              { name: "stockQuantity", label: "Quantidade em estoque" },
              { name: "fotoUrl", label: "Imagen" },
              {
                name: "category",
                label: "Tipo do Produtos",
                type: "select",
                options: categoryOptions,
              },
            ]}
            onSubmit={handleSubmit}
            submitLabel="Cadastrar"
            loading={loading}
            showCancel
            onCancel={() => {
              setModalShow(false);
            }}
            submitClassName={
              styles.modalProdutosButton
            } /* se o Card aceita essa prop */
          />
        </Modal.Body>
      </Modal>

      {/* FAB */}
      <FAB
        onClick={() => setModalShow(true)}
        text={
          <UserPlusIcon weight="bold" size={24} style={{ marginLeft: 8 }} />
        }
      />

      {/* Modal de sucesso */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        centered
        className={styles.successProdutosModal}
      >
        <Modal.Body className={`text-center ${styles.successProdutosBody}`}>
          <div className={styles.successProdutosIconContainer} aria-hidden>
            <span className={styles.successProdutosIcon}>✓</span>
          </div>
          <h5 className={styles.successProdutosTitle}>
            Produto cadastrado com sucesso!
          </h5>
        </Modal.Body>
        <Modal.Footer
          className={`justify-content-center ${styles.successProdutosFooter}`}
        >
          <Button
            variant="success"
            onClick={() => setSuccessModalShow(false)}
            className={styles.successProdutosButton}
          >
            OK
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
        <Modal.Body className={`text-center ${styles.warningProdutosBody}`}>
          <div className={styles.warningProdutosIconContainer} aria-hidden>
            <span className={styles.warningProdutosIcon}>⚠️</span>
          </div>
          <h5 className={styles.warningProdutosTitle}>Atenção</h5>
          <p className={styles.warningProdutosMessage}>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer
          className={`justify-content-center ${styles.warningProdutosFooter}`}
        >
          <Button
            variant="warning"
            onClick={() => setWarningModalShow(false)}
            className={styles.warningProdutosButton}
          >
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
