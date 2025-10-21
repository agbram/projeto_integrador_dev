"use client";

import React, { useState } from "react";
import Card from "@/components/Card";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FAB from "@/components/FAB";

export default function ClientesModal() {
  const [modalShow, setModalShow] = useState(false);

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
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Cadastro de Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Card com formulário */}
          <Card
            title="Cadastrar Cliente"
            fields={[
              { name: "name", label: "Nome" },
              { name: "cnpj", label: "CNPJ" },
              { name: "contact", label: "Contato" },
              { name: "email", label: "E-mail", type: "email" },
              { name: "address", label: "Endereço" },
              { name: "modality", label: "Modalidade do Cliente" },
            ]}
            onSubmit={(data) => {
              console.log("Cliente cadastrado:", data);
              alert("Cliente cadastrado com sucesso!");
              setModalShow(false); // fecha modal após cadastro
            }}
            submitLabel="Salvar Cliente"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
