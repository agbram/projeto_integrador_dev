"use client";

import React, { useContext, useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { UserPlusIcon } from "@phosphor-icons/react";
import CardCliente from "@/components/Cards/CardCliente";
import Customer, { CustomerType } from "@/models/Customer";
import styles from "./styles.module.css";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import ActionBar from "@/components/Navigation/ActionBar";
import { PageActions } from "@/contexts/PageActions";
import toast from 'react-hot-toast'; // <-- import adicionado

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

export default function ClientesPage() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState<"check" | "register">("check");
  const [docDataCheck, setDocDataCheck] = useState<any>(null);
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [selectCliente, setSelectCliente] = useState<Customer>();
  const [documentValue, setDocumentValue] = useState("");
  const { setShowFilterButton, setFilterOptions, setHandleFilter, setShowAddButton, setHandleAdd } = useContext(PageActions);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Computa a lista filtrada a partir do estado completo
  const clientesFiltrados = clientes.filter((c) => {
    if (activeFilter === "disabled") return c.isActive === false;
    if (activeFilter === "all") return c.isActive !== false;
    // filtros de modalidade — só entre ativos
    return c.isActive !== false && c.modality === activeFilter;
  });

  useEffect(() => {
    setShowAddButton(true);
    setHandleAdd(() => { setModalShow(true); });

    setShowFilterButton(true);
    setFilterOptions([
      { label: "Todos", value: "all" },
      { label: "Atacado", value: "Atacado" },
      { label: "Varejo", value: "Varejo" },
      { label: "Desativados", value: "disabled" },
    ]);
    setHandleFilter((value: string) => {
      setActiveFilter(value);
    });

    return () => {
      setShowFilterButton(false);
      setFilterOptions([]);
      setHandleAdd(() => () => {});
    };
  }, []);

  const modalityOptions = [
    { value: "Atacado", label: "Atacado" },
    { value: "Varejo", label: "Varejo" },
  ];

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/customers");
      setClientes(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para visualizar Clientes.", { id: "page_error" });
      } else {
        toast.error("Erro ao carregar os clientes cadastrados.", { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    return () => {
      toast.dismiss("page_error");
    };
  }, []);

  const verificarDocumento = async (data: any) => {
    const doc = data.document.replace(/\D/g, "");
    const type = doc.length <= 11 ? CustomerType.PF_CPF : CustomerType.PJ_CNPJ;

    if (!doc) {
      toast.error("Por favor, informe um CPF ou CNPJ.");
      return;
    }

    if (type === CustomerType.PF_CPF && !isValidCPF(doc)) {
      toast.error("CPF inválido. Verifique e tente novamente.");
      return;
    }

    if (type === CustomerType.PJ_CNPJ && !isValidCNPJ(doc)) {
      toast.error("CNPJ inválido. Verifique e tente novamente.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/customers/check-document/${doc}`);
      toast.error(
        `${type === CustomerType.PF_CPF ? "CPF" : "CNPJ"} já cadastrado no sistema. Verifique os dados e tente novamente.`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDocDataCheck({ document: data.document, type: type });
        setFormStep("register");
      } else {
        toast.error("Erro ao verificar documento. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCadastroSubmit = async (data: any) => {
    setLoading(true);
    try {
      const fullData = { ...docDataCheck, ...data };
      const response = await api.post("/customers", fullData);
      setClientes((prev) => [...prev, response.data]);
      toast.success("Cliente cadastrado com sucesso!");
      setDocumentValue("");
      setModalShow(false);
      setFormStep("check");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAlteracoes = async (data: any) => {
    setLoading(true);
    try {
      const fullData = { ...data };
      const response = await api.put(`/customers/${selectCliente?.id}`, fullData);
      setClientes(prev => prev.map(cliente =>
        cliente.id === selectCliente?.id ? response.data : cliente
      ));
      toast.success("Cliente atualizado com sucesso!");
      setModalEditShow(false);
    } catch (error: any) {
      console.error("Erro ao editar cliente:", error);
      toast.error(error.response?.data?.message || "Erro ao editar cliente. Tente novamente.");
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

  const handleCloseWarningModal = () => {
    setModalEditShow(true);
    setWarningDeleteModalShow(false);
  };

  const handleWarningDelete = () => {
    setModalEditShow(false);
    setWarningDeleteModalShow(true);
    setWarningMessage("Deseja realmente desativar esse cliente?");
  };

  const handleDesativaUser = async () => {
    setLoading(true);
    try {
      await api.delete(`/customers/${selectCliente?.id}`);
      setWarningDeleteModalShow(false);
      toast.success("Cliente desativado com sucesso!");
      setModalEditShow(false);
      fetchClientes();
    } catch (error: any) {
      console.error("Erro ao desativar cliente:", error);
      toast.error(error.response?.data?.message || "Erro ao desativar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {clientesFiltrados.length === 0 ? (
          <div className="emptyStateStandard">
            <h3>
              {activeFilter === "disabled"
                ? "Nenhum cliente desativado"
                : "Nenhum Cliente encontrado"}
            </h3>
            <p>
              {activeFilter === "disabled"
                ? "Não há clientes desativados no momento"
                : "Cadastre seu primeiro cliente para começar"}
            </p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className={styles.divContainerCliente}>
              <CardCliente
                title={`${cliente.name}`}
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
          ))
        )}
      </div>

      {/* Modal de Edição */}
      <Modal
        show={modalEditShow}
        onHide={handleCloseEditModal}
        centered
        size="lg"
        className={styles.modalClientes}
      >
        <Modal.Header closeButton className={styles.modalClientesHeader}>
          <Modal.Title className={styles.modalClientesTitle}>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBodyEdit}>
          <Card
            key={selectCliente?.id}
            title=""
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

      {/* Modal de Cadastro */}
      <Modal
        show={modalShow}
        onHide={handleCloseModal}
        size="lg"
        centered
        className={styles.modalClientes}
      >
        <Modal.Header closeButton className={styles.modalClientesHeader}>
          <Modal.Title className={styles.modalClientesTitle}>
            {formStep === "check" ? "Verificar CPF ou CNPJ" : "Cadastro de Cliente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalClientesBody}>
          {formStep === "check" && (
            <Card
              title=""
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
              title=""
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
              onSubmit={handleCadastroSubmit}
              submitLabel="Cadastrar"
              loading={loading}
              showCancel
              onCancel={handleCloseModal}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        show={warningDeleteModalShow}
        onHide={() => setWarningDeleteModalShow(false)}
        size="sm"
        centered
        className={styles.warningClientesModal}
      >
        <Modal.Body className={styles.warningClientesBody}>
          <div className={styles.warningClientesIconContainer} aria-hidden>
            <span className={styles.warningClientesIcon}>⚠</span>
          </div>
          <h5 className={styles.warningClientesTitle}>Confirmação</h5>
          <p className={styles.warningClientesMessage}>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={handleCloseWarningModal} CancelLabel="Cancelar" />
          <Button variant="danger" onClick={handleDesativaUser} className={styles.warningClientesButton}>
            Desativar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modais de sucesso e aviso foram removidos */}
    </>
  );
} 


