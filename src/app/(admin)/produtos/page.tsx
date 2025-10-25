"use client";

import React, { useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import styles from "./styles.module.css";

export default function ProdutosModal() {
  const [modalShow, setModalShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { value: "Bolos", label: "Bolos" },
    { value: "Doces", label: "Doces" },
  ];
  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post("/products", data);
      console.log("Cliente cadastrado:", response.data);

      setSuccessModalShow(true);
      setModalShow(false);
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      if (
        error.response?.status === 409 ||
        error.response?.data?.error?.includes("Produto") ||
        error.response?.data?.error?.includes("já cadastrado")
      ) {
        setWarningMessage(
          "Produto já cadastrado no sistema. Verifique os dados e tente novamente."
        );
      } else {
        setWarningMessage("Erro ao cadastrar produto. Tente novamente.");
      }
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FAB onClick={() => setModalShow(true)} text="+" />
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className={styles.modal}
      >
        <Modal.Body className={styles.modalBody}>
          <Card
            title="Cadastro de Produtos"
            fields={[
              { name: "name", label: "Nome" },
              { name: "costPrice", label: "Preço de custo" },
              { name: "markupPercent", label: "Percentual de Markup" },
              { name: "stockQuantity", label: "Quantidade em estoque" },
              {
                name: "category",
                label: "Tipo do Produtos",
                type: "select",
                options: categoryOptions,
              },
            ]}
            submitLabel="Salvar"
            loading={loading}
            onSubmit={function (data: Record<string, string>): void {
              throw new Error("Function not implemented.");
            }}
          />
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setModalShow(false)}
            className={styles.button}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className={styles.successModal}
      >
        <Modal.Body className={`text-center ${styles.successModalBody}`}>
          <div className={`mb-3 ${styles.successIconContainer}`}>
            <div className={styles.successIcon}>✓</div>
          </div>
          <h5 className={styles.successTitle}>
            Produtos cadastrado com sucesso!
          </h5>
        </Modal.Body>
        <Modal.Footer
          className={`justify-content-center ${styles.successModalFooter}`}
        >
          <Button
            variant="success"
            onClick={() => setSuccessModalShow(false)}
            className={styles.successButton}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={warningModalShow}
        onHide={() => setWarningModalShow(false)}
        size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className={styles.warningModal}
      >
        <Modal.Body className={`text-center ${styles.warningModalBody}`}>
          <div className={`mb-3 ${styles.warningIconContainer}`}>
            <div className={styles.warningIcon}>⚠️</div>
          </div>
          <h5 className={styles.warningTitle}>Atenção</h5>
          <p className={styles.warningMessage}>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer
          className={`justify-content-center ${styles.warningModalFooter}`}
        >
          <Button
            variant="warning"
            onClick={() => setWarningModalShow(false)}
            className={styles.warningButton}
          >
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
