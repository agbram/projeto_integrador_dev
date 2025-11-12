"use client";

import React, { useEffect, useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import CardOrder from "@/components/Cards/CardPedidos";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import { usePageActions } from "@/hooks/usePageActions";
import Order from "@/models/order";

export default function PedidosModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formStep, setFormStep] = useState<
    "checkCustomer" | "selectProducts" | "order"
  >("checkCustomer");

  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [selectPedido, setSelectPedido] = useState<Order>();
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [products, setProducts] = useState<{ id: number; name: string; price: number }[]>([]);
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number }[]>([]);

  const pageAction = usePageActions();

  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "DELIVERED", label: "Entregue" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  useEffect(() => {
    pageAction.setHandleAdd(() => setModalShow(true));
    return () => pageAction.setHandleAdd(() => () => {});
  }, []);

  // 🧾 Buscar dados
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchCustomers();
    fetchProducts();
  }, []);

  const handleCloseModal = () => {
    setModalShow(false);
    setFormStep("checkCustomer");
    setSelectedCustomer(null);
    setOrderItems([]);
  };

  // ➕ Incrementar quantidade
  const handleAddQuantity = (productId: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  // ➖ Decrementar quantidade
  const handleRemoveQuantity = (productId: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, i.quantity - 1) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const getQuantity = (productId: number) => {
    const item = orderItems.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  // 💾 Cadastrar pedido
  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const formattedData = {
        customerId: selectedCustomer?.id,
        deliveryDate: data.deliveryDate
          ? new Date(String(data.deliveryDate))
          : null,
        status: "PENDING",
        notes: data.notes || "",
        total: data.total ? parseFloat(String(data.total)) : 0,
        userId: 1,
        items: orderItems, // produtos e quantidades
      };

      const response = await api.post("/orders", formattedData);
      console.log("Pedido cadastrado:", response.data);
      fetchPedidos();

      setSuccessMessage("Pedido cadastrado com sucesso!");
      setSuccessModalShow(true);
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao cadastrar Pedido:", error);
      setWarningMessage("Erro ao cadastrar Pedido. Tente novamente.");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {pedidos.map((p) => (
          <div key={p.id} className={styles.divContainerCliente}>
            <CardOrder
              title={`${p.customerName}`}
              order={p}
              loading={loading}
              actions={[
                {
                  label: "Editar",
                  onClick: () => {
                    setSelectPedido(p);
                    setModalEditShow(true);
                  },
                },
              ]}
            />
          </div>
        ))}
      </div>

      {/* 🧩 MODAL PRINCIPAL */}
      <Modal show={modalShow} onHide={handleCloseModal} size="lg" centered>
        <Modal.Body className={styles.modalPedidosBody}>
          {/* 🧍 Selecionar cliente */}
          {formStep === "checkCustomer" && (
            <div className={styles.searchContainer}>
              <h4>Selecione um cliente</h4>
              <div className={styles.searchWrapper}>
                <MagnifyingGlassIcon className={styles.searchIcon} width={20} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>

              {isSearchFocused && (
                <div className={styles.containerResults}>
                  {customers
                    .filter((c) =>
                      c.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((c) => (
                      <div
                        key={c.id}
                        className={styles.searchItem}
                        onMouseDown={() => {
                          setSelectedCustomer(c);
                          setFormStep("selectProducts");
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 🧃 Selecionar produtos */}
          {formStep === "selectProducts" && selectedCustomer && (
            <div className={styles.productSelectionContainer}>
              <h4>Selecione os produtos para {selectedCustomer.name}</h4>

              <div className={styles.productList}>
                {products.map((p) => (
                  <div key={p.id} className={styles.productItem}>
                    <span className={styles.productName}>{p.name}</span>
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.btnQuantity}
                        onClick={() => handleRemoveQuantity(p.id)}
                      >
                        –
                      </button>
                      <span className={styles.quantityValue}>
                        {getQuantity(p.id)}
                      </span>
                      <button
                        className={styles.btnQuantity}
                        onClick={() => handleAddQuantity(p.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.productsActions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFormStep("checkCustomer");
                    setSelectedCustomer(null);
                    setOrderItems([]);
                  }}
                >
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setFormStep("order")}
                  disabled={orderItems.length === 0}
                >
                  Avançar
                </Button>
              </div>
            </div>
          )}

          {/* 📦 Cadastrar pedido */}
          {formStep === "order" && selectedCustomer && (
            <Card
              title={`Cadastro de Pedido — ${selectedCustomer.name}`}
              fields={[
                { name: "deliveryDate", label: "Data de Entrega (opcional)" },
                { name: "notes", label: "Observações" },
                { name: "total", label: "Total do Pedido (R$)" },
              ]}
              onSubmit={handleSubmit}
              submitLabel="Cadastrar Pedido"
              loading={loading}
              showCancel
              onCancel={() => setFormStep("selectProducts")}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* FAB */}
      <FAB onClick={() => setModalShow(true)} text="Adicionar" />

      {/* Modal de sucesso */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        centered
      >
        <Modal.Body className={`text-center ${styles.successProdutosBody}`}>
          <div className={styles.successProdutosIconContainer} aria-hidden>
            <span className={styles.successProdutosIcon}>✓</span>
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
          <div style={{ fontSize: "48px", color: "#ffc107" }}>⚠️</div>
          <h5>
            <strong>Atenção</strong>
          </h5>
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
