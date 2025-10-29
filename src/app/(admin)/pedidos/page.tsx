"use client";

import React, { useState } from "react";
import Card from "../../../components/Cards/Card";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FAB from "@/components/FAB";
import api from "@/services/api";

export default function EstoqueModal() {
  const [modalShow, setModalShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const typeOptions = [
    { value: "Bolos", label: "Bolos" },
    { value: "Doces", label: "Doces" }
  ];
  const clientsOrdem = [
      { value: "Bolos", label: "Bolos" },
      { value: "Doces", label: "Doces" }
    ];
    const proutosOrden = [
      { value: "Bolos", label: "Bolos" },
      { value: "Doces", label: "Doces" }
    ];
    


  return (
    <>
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
            title="Criar pedidos"
            fields={[
              {
                name: "Type",
                label: "Clientes",
                type: "select",
                options: clientsOrdem
              },
              {
                name: "Type",
                label: "Tipo do Produtos",
                type: "select",
                options: typeOptions
              },
              {
                name: "Type",
                label: "Produtos",
                type: "select",
                options: proutosOrden,
              },
            { name: "quantidade", label: "quantidade" },
              
            ]}

            submitLabel="Salvar"
            loading={loading} onSubmit={function (data: Record<string, string>): void {
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