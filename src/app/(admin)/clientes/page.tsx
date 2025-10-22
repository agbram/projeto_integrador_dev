"use client";

import React, { useState } from "react";
import Card from "@/components/Card";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FAB from "@/components/FAB";
import api from "@/services/api";

export default function ClientesModal() {
  const [modalShow, setModalShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const modalityOptions = [
    { value: "Atacado", label: "Atacado" },
    { value: "Varejo", label: "Varejo" }
  ];

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        ...data,
        cnpj: data.cnpj.replace(/\D/g, '')
      };

      const response = await api.post('/customers', formattedData);
      console.log("Cliente cadastrado:", response.data);
      setModalShow(false);
      setSuccessModalShow(true);
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      
      if (error.response?.status === 409 || 
          error.response?.data?.error?.includes('CNPJ') || 
          error.response?.data?.error?.includes('já cadastrado')) {
        setWarningMessage("CNPJ já cadastrado no sistema. Verifique os dados e tente novamente.");
        setWarningModalShow(true);
      } else {
        // Outros erros
        setWarningMessage("Erro ao cadastrar cliente. Tente novamente.");
        setWarningModalShow(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FAB
        onClick={() => setModalShow(true)}
        text="+"
      />
      
      {/* Modal de Cadastro */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <Card
            title="Cadastro de Clientes"
            fields={[
              { name: "name", label: "Nome" },
              { name: "cnpj", label: "CNPJ" },
              { name: "contact", label: "Contato" },
              { name: "email", label: "E-mail", type: "email" },
              { name: "address", label: "Endereço" },
              { 
                name: "modality", 
                label: "Modalidade do Cliente", 
                type: "select", 
                options: modalityOptions 
              },
            ]}
            onSubmit={handleSubmit}
            submitLabel="Salvar"
            loading={loading}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso */}
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
          <h5>Cliente cadastrado com sucesso!</h5>
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

      {/* Modal de Warning para CNPJ duplicado */}
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