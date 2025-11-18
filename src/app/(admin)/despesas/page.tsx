"use client";

import React, { useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FAB from "@/components/FAB";
import api from "@/services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css"
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/ssr";

export default function DespesasModal() {
  const [modalShow, setModalShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { value: "Despesas Variavel", label: "Despesas Variavel" },
    { value: "Despesas Fixas", label: "Despesas Fixas" }
  ];
  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post("/products", data);
      console.log("Despesas Anotada:", response.data);

      setSuccessModalShow(true);
      setModalShow(false);

    } catch (error: any) {
      console.error("Erro ao Anotar Despesas:", error);
      if (
        error.response?.status === 409 ||
        error.response?.data?.error?.includes("Despesas") ||
        error.response?.data?.error?.includes("já cadastrado")
      ) {
        setWarningMessage("Despesas já cadastrada no sistema. Verifique os dados e tente novamente.");
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
      <h1 className={styles.dev}>EM DESEVOLVIMENTO...<HourglassMediumIcon size={60} /></h1>
      <FAB
        onClick={() => setModalShow(true)}
        text="+"
      />
      
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <Card
            title="Cadastro de Produtoss"
            fields={[
              { name: "description", label: "Descrição" },
              {name: "value", label:"Valor"},
              { name: "date", label: "Data" },
              { name: "recurring", label: "Despesas Recorrente" },
              { name: "note", label: "Nota de Despesas" },
              { name: "category", label: "Tipo de Despesas", type: "select", options: categoryOptions},
            ]}

            submitLabel="Salvar"
            loading={loading} onSubmit={function (data: FormData): void {
              throw new Error("Function not implemented.");
            } }          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
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
      >
        <Modal.Body className="text-center">
          <div className="mb-3">
            <div style={{ fontSize: '48px', color: '#28a745' }}>✓</div>
          </div>
          <h5>Produtos cadastrado com sucesso!</h5>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="success" 
            onClick={() => setSuccessModalShow(false)}
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
      >
        <Modal.Body className="text-center">
          <div className="mb-3">
            <div style={{ fontSize: '48px', color: '#ffc107' }}>⚠️</div>
          </div>
          <h5>Atenção</h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="warning" 
            onClick={() => setWarningModalShow(false)}
          >
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}