"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { UserPlusIcon, PencilLineIcon } from "@phosphor-icons/react";
import CardCliente from "@/components/Cards/CardCliente";

export default function ClientesModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState<"check" | "register">("check");
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [selectCliente, setSelectCliente] = useState<Customer>();

  const modalityOptions = [
    { value: "Atacado", label: "Atacado" },
    { value: "Varejo", label: "Varejo" },
  ];

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers"); // rota GET dos clientes
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setWarningMessage("Erro ao carregar os clientes cadastrados.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchClientes();},[]);

  const isValidCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs conhecidos como inválidos
    if (/^(\d)\1+$/.test(cnpj)) return false;

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

    tamanho = tamanho + 1;
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

  // Verificação inicial de CNPJ
  const cadastroCnpj = async (data: any) => {
    const cnpj = data.cnpj.replace(/\D/g, "");

    // ✅ 1. Verifica se o campo foi preenchido e se o formato é válido
    if (!cnpj) {
      setWarningMessage("Por favor, informe um CNPJ.");
      setWarningModalShow(true);
      return;
    }

    if (!isValidCNPJ(cnpj)) {
      setWarningMessage(
        "CNPJ inválido. Verifique os números e tente novamente."
      );
      setWarningModalShow(true);
      return;
    }

    // ✅ 2. Só faz a requisição se o CNPJ for válido
    setLoading(true);
    try {
      const response = await api.get(`/customers/cnpj-check/${cnpj}`);
      // Se o GET retornar sucesso, o cliente já existe
      setWarningMessage(
        "CNPJ já cadastrado no sistema. Verifique os dados e tente novamente."
      );
      setWarningModalShow(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCnpjData({ cnpj: data.cnpj });
        setFormStep("register");
      } else {
        setWarningMessage("Erro ao verificar CNPJ. Tente novamente.");
        setWarningModalShow(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cadastro completo do cliente
  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formattedData = {
        ...data,
        cnpj: cnpjData?.cnpj.replace(/\D/g, ""),
      };

      const response = await api.post("/customers", formattedData);
      console.log("Cliente cadastrado:", response.data);

      setSuccessModalShow(true);
      setModalShow(false);
      setFormStep("check");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      if (
        error.response?.status === 409 ||
        error.response?.data?.error?.includes("CNPJ") ||
        error.response?.data?.error?.includes("já cadastrado")
      ) {
        setWarningMessage(
          "CNPJ já cadastrado no sistema. Verifique os dados e tente novamente."
        );
      } else {
        setWarningMessage("Erro ao cadastrar cliente. Tente novamente.");
      }
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
  {clientes.map((cliente) => (
    <div key={cliente.id} style={{ position: "relative", marginBottom: "20px" }}>
      <CardCliente
        title={`Cliente: ${cliente.name}`}
        customer={cliente}
        loading={loading}
        actions={[
          {
            label: "Editar",
            onClick: () => {
                setSelectCliente(cliente)
                setModalEditShow(true)
            }
        }]}
      />
    </div>
  ))}
</div>

<Modal
show={modalEditShow}
onHide={()=>{
  setModalEditShow(false);
}}
size="lg"
centered
>
  <Modal.Body>
    <Card
    title= {`Editar Cliente ${selectCliente?.name}`}
    fields={[
                { name: "name", value: selectCliente?.name, label: "Nome"},
                { name: "contact", value: selectCliente?.contact, label: "Contato" },
                { name: "email", label: "E-mail", type: "email" },
                { name: "address", label: "Endereço" },
                {
                  name: "modality",
                  label: "Modalidade do Cliente",
                  type: "select",
                  options: modalityOptions,
                },
              ]}
              onSubmit={()=>{

              }}
              ></Card>
  </Modal.Body>
</Modal>

      <FAB
        onClick={() => setModalShow(true)}
        text={
          <UserPlusIcon weight="bold" size={24} style={{ marginLeft: 8 }} />
        }
      />
      {/* Modal principal */}
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setFormStep("check");
        }}
        size="lg"
        centered
      >
        <Modal.Body>
          {formStep === "check" && (
            <Card
              title="Verificar CNPJ"
              fields={[{ name: "cnpj", label: "CNPJ" }]}
              onSubmit={cadastroCnpj}
              submitLabel="Próximo"
              loading={loading}
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
                  options: modalityOptions,
                },
              ]}
              onSubmit={handleSubmit}
              submitLabel="Cadastrar"
              loading={loading}
            />
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setModalShow(false);
              setFormStep("check");
            }}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal de Sucesso */}
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
          <h5>Cliente cadastrado com sucesso!</h5>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="success" onClick={() => setSuccessModalShow(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal de Aviso */}
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
