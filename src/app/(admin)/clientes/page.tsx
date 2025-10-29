"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { UserPlusIcon } from "@phosphor-icons/react";
import CardCliente from "@/components/Cards/CardCliente";
import Customer, { CustomerType } from "@/models/Customer";
import styles from "./styles.module.css";

// ✅ Funções de validação movidas para fora do componente
const isValidCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
};

const isValidCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho++;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

const applyMask = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
};

export default function ClientesModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState<"check" | "register">("check");
  const [docDataCheck, setDocDataCheck] = useState<any>(null);
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [selectCliente, setSelectCliente] = useState<Customer>();
  const [documentValue, setDocumentValue] = useState("");

  const modalityOptions = [
    { value: "Atacado", label: "Atacado" },
    { value: "Varejo", label: "Varejo" },
  ];

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setWarningMessage("Erro ao carregar os clientes cadastrados.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const verificarDocumento = async (data: any) => {
    const doc = data.document.replace(/\D/g, "");
    const type = doc.length <= 11 ? CustomerType.PF_CPF : CustomerType.PJ_CNPJ;
    
    if (!doc) {
      setWarningMessage("Por favor, informe um CPF ou CNPJ.");
      setWarningModalShow(true);
      return;
    }

    if (type === CustomerType.PF_CPF && !isValidCPF(doc)) {
      setWarningMessage("CPF inválido. Verifique e tente novamente.");
      setWarningModalShow(true);
      return;
    }

    if (type === CustomerType.PJ_CNPJ && !isValidCNPJ(doc)) {
      setWarningMessage("CNPJ inválido. Verifique e tente novamente.");
      setWarningModalShow(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/customers/check-document/${doc}`);
      setWarningMessage(
        `${type === CustomerType.PF_CPF ? "CPF" : "CNPJ"} já cadastrado no sistema. Verifique os dados e tente novamente.`
      );
      setWarningModalShow(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDocDataCheck({ document: data.document, type: type });
        setFormStep("register");
      } else {
        setWarningMessage("Erro ao verificar documento. Tente novamente.");
        setWarningModalShow(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {      
      const fullData = {
        ...docDataCheck,
        ...data,
      };
      
      console.log("Dados do cliente:", fullData);
      const response = await api.post("/customers", fullData);
      console.log("Cliente cadastrado:", response.data);

      setClientes((prev) => [...prev, response.data]);
      setSuccessMessage("Cliente cadastrado com sucesso!");
      setSuccessModalShow(true);
      setModalShow(false);
      setFormStep("check");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      setWarningMessage(
        error.response?.data?.message || "Erro ao cadastrar cliente. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAlteracoes = async (data: any) => {
    setLoading(true);
    try {      
      const fullData = {
        ...data
      };
      
      console.log("Editando cliente:", fullData);
      const response = await api.put(`/customers/${selectCliente?.id}`, fullData);
      console.log("Cliente alterado com sucesso:", response.data);

      // ✅ Atualizar a lista de clientes
      setClientes(prev => prev.map(cliente => 
        cliente.id === selectCliente?.id ? response.data : cliente
      ));
      
      setSuccessMessage("Cliente atualizado com sucesso!");
      setSuccessModalShow(true);
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao editar cliente:", error);
      setWarningMessage(
        error.response?.data?.message || "Erro ao editar cliente. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setFormStep("check");
    setDocumentValue("");
    setDocDataCheck(null);
  };

  const handleCloseEditModal = () => {
    setModalEditShow(false);
    setSelectCliente(undefined);
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className={styles.divContainerCliente}
          >
            <CardCliente
              title={`Cliente: ${cliente.name}`}
              customer={cliente}
              loading={loading}
              actions={[
                {
                  label: "Editar",
                  onClick: () => {
                    setSelectCliente(cliente);
                    setModalEditShow(true);
                  },
                },
              ]}
            />
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      <Modal
        show={modalEditShow}
        onHide={handleCloseEditModal}
        size="lg"
        centered
      >
        <Modal.Body>
          <Card
            key={selectCliente?.id}
            title="Editar Cliente" 
            fields={[
              { name: "name", value: selectCliente?.name || "", label: "Nome" },
              { name: "contact", value: selectCliente?.contact || "", label: "Contato" },
              { name: "email", value: selectCliente?.email || "", label: "E-mail", type: "email" },
              { name: "address", value: selectCliente?.address || "", label: "Endereço" },
              {
                name: "modality",
                value: selectCliente?.modality || "",
                label: "Modalidade do Cliente",
                type: "select",
                options: modalityOptions,
              },
            ]}
            showCancel
            onCancel={handleCloseEditModal}
            onSubmit={handleSalvarAlteracoes}
            submitLabel="Salvar"
            loading={loading}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de Cadastro */}
      <Modal
        show={modalShow}
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Body>
          {formStep === "check" && (
            <Card
              title="Verificar CPF ou CNPJ"
              fields={[
                {
                  name: "document",
                  label: "CPF ou CNPJ",
                  type: "text",
                  value: documentValue,
                },
              ]}
              onChange={(name, value) => {
                if (name === "document") {
                  setDocumentValue(applyMask(value));
                }
              }}
              onSubmit={() => verificarDocumento({ document: documentValue })}
              submitLabel="Próximo"
              loading={loading}
              showCancel
              onCancel={handleCloseModal}
            />
          )}

          {formStep === "register" && (
            <Card
              title="Cadastro de cliente"
              fields={[
                { name: "name", label: "Nome" },
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
              submitLabel="Cadastrar"
              loading={loading}
              showCancel
              onCancel={handleCloseModal}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* FAB */}
      <FAB
        onClick={() => setModalShow(true)}
        text={<UserPlusIcon weight="bold" size={24} style={{ marginLeft: 8 }}  />}
      />

      {/* Modal de sucesso */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        centered
      >
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#28a745" }}>
            ✓
          </div>
          <h5>{successMessage}</h5>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="success" onClick={() => setSuccessModalShow(false)}>
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
      >
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#ffc107" }}>
            ⚠️
          </div>
          <h5>Atenção</h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="warning" onClick={() => setWarningModalShow(false)}>
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}