"use client";

import React, { useEffect, useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import CardOrder from "@/components/Cards/CardPedidos";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import {
  MagnifyingGlassIcon,
  FilePdfIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  ReceiptIcon,
  ReceiptXIcon,
} from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import { usePageActions } from "@/hooks/usePageActions";
import Order from "@/models/order";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import jsPDF from "jspdf";

export default function PedidosModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const [warningDeliveredModalShow, setWarningDeliveredModalShow] =
    useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [formStep, setFormStep] = useState<
    "checkCustomer" | "selectProducts" | "order"
  >("checkCustomer");

  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [selectPedido, setSelectPedido] = useState<Order>();
  const [pedidoToCancel, setPedidoToCancel] = useState<Order>();
  const [pedidoToDelivered, setPedidoToDelivered] = useState<Order>();
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Estados para pesquisa de produtos
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isCustomerSearchFocused, setIsCustomerSearchFocused] = useState(false);
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<
    {
      id: number;
      name: string;
      salePrice: number;
    }[]
  >([]);

  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      salePrice: number;
    }[]
  >([]);

  const [orderItems, setOrderItems] = useState<
    {
      productId: number;
      quantity: number;
      productName: string;
      unitPrice: number;
    }[]
  >([]);

  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

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

  // Filtra produtos baseado no termo de pesquisa
  useEffect(() => {
    if (productSearchTerm) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 10)); // Limita a 10 resultados
    } else {
      setFilteredProducts([]);
    }
  }, [productSearchTerm, products]);

  const gerarNotaFiscal = (pedido: Order) => {
    const doc = new jsPDF();

    // Configurações iniciais
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);

    // Cabeçalho
    doc.text("NOTA FISCAL", 105, 20, { align: "center" });

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);

    // Informações da Empresa
    doc.setFontSize(12);
    doc.text("DOCE SABOR - CONFEITARIA", 20, 35);
    doc.setFontSize(10);
    doc.text("CNPJ: 12.345.678/0001-90", 20, 42);
    doc.text("Rua das Flores, 123 - Centro", 20, 48);
    doc.text("São Paulo - SP - CEP: 01234-567", 20, 54);
    doc.text("Telefone: (11) 9999-9999", 20, 60);

    // Informações do Cliente
    doc.setFontSize(12);
    doc.text("DADOS DO CLIENTE", 20, 72);
    doc.setFontSize(10);
    doc.text(`Nome: ${pedido.customer?.name || "Não informado"}`, 20, 79);
    doc.text(
      `Telefone: ${pedido.customer?.contact || "Não informado"}`,
      20,
      85
    );
    doc.text(
      `Endereço: ${pedido.customer?.address || "Não informado"}`,
      20,
      91
    );

    // Informações do Pedido
    doc.setFontSize(12);
    doc.text("DADOS DO PEDIDO", 120, 72);
    doc.setFontSize(10);
    doc.text(`Nº do Pedido: ${pedido.id}`, 120, 79);
    doc.text(
      `Data: ${
        pedido.orderDate
          ? new Date(pedido.orderDate).toLocaleDateString("pt-BR")
          : "A combinar"
      }`,
      120,
      85
    );
    doc.text(
      `Entrega: ${
        pedido.deliveryDate
          ? new Date(pedido.deliveryDate).toLocaleDateString("pt-BR")
          : "A combinar"
      }`,
      120,
      91
    );
    doc.text(`Status: ${getStatusText(pedido.status)}`, 120, 97);

    // Tabela de Produtos
    doc.setFontSize(12);
    doc.text("ITENS DO PEDIDO", 20, 112);

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 117, 170, 8, "F");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Produto", 22, 122);
    doc.text("Qtd", 120, 122);
    doc.text("Valor Unit.", 140, 122);
    doc.text("Subtotal", 165, 122);

    let yPosition = 132;

    // Itens do pedido
    pedido.items?.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.product?.name || "Produto não encontrado", 22, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`R$ ${item.unitPrice?.toFixed(2) || "0.00"}`, 140, yPosition);
      doc.text(`R$ ${item.subtotal?.toFixed(2) || "0.00"}`, 165, yPosition);

      yPosition += 8;
    });

    // Total
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.line(120, yPosition + 10, 190, yPosition + 10);
    doc.text("TOTAL DO PEDIDO:", 120, yPosition + 18);
    doc.text(`R$ ${pedido.total?.toFixed(2) || "0.00"}`, 165, yPosition + 18);

    // Observações
    if (pedido.notes) {
      doc.setFontSize(10);
      doc.text("OBSERVAÇÕES:", 20, yPosition + 30);
      doc.text(pedido.notes, 20, yPosition + 37, { maxWidth: 170 });
    }

    // Rodapé
    const footerY = 280;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Agradecemos pela preferência!", 105, footerY, {
      align: "center",
    });
    doc.text(
      "Doces Sabor Confeitaria - Qualidade e Sabor em Cada Doce",
      105,
      footerY + 5,
      { align: "center" }
    );

    // Salvar o PDF
    doc.save(`nota-fiscal-pedido-${pedido.id}.pdf`);
  };

  // ✅ Função auxiliar para converter status
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: "Pendente",
      IN_PROGRESS: "Em Andamento",
      IN_PRODUCTION: "Em Produção",
      READY_FOR_DELIVERY: "Pronto para Entrega",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado",
      PRODUCTION_COMPLETE: "Produção Concluída",
    };
    return statusMap[status] || status;
  };

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

  const handleRemoveFromProduction = async (orderId: number) => {
  try {
    console.log(`🔄 Removendo pedido ${orderId} da produção...`);
    
    // Chamar a API para remover o pedido da produção
    const response = await api.delete(`/order/${orderId}`);
    
    console.log(`✅ Pedido ${orderId} removido da produção:`, response.data);
    return { success: true, message: 'Pedido removido da produção' };
  } catch (error: any) {
    console.error(`❌ Erro ao remover pedido ${orderId} da produção:`, error);
    
    if (error.response?.status === 404) {
      console.log(`ℹ️ Pedido ${orderId} não estava na produção`);
      return { success: true, message: 'Pedido não estava na produção' };
    }
    
    throw new Error(error.response?.data?.message || 'Erro ao remover da produção');
  }
};

const handleUpdateOrderStatus = async (
  orderId: number,
  newStatus: string
) => {
  setUpdatingOrderId(orderId);
  try {
    const response = await api.put(`/orders/atualiza-status/${orderId}`, {
      status: newStatus,
    });

    setPedidos((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus as any,
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );

    console.log(`✅ Pedido ${orderId} marcado como ${newStatus}`);

    if (newStatus === "CANCELLED") {
      try {
        await handleRemoveFromProduction(orderId);
        console.log(`🗑️ Pedido ${orderId} removido da produção após cancelamento`);
      } catch (productionError) {
        console.error(`⚠️ Aviso: Não foi possível remover pedido ${orderId} da produção:`, productionError);
      }
    }

    if (newStatus === "DELIVERED") {
      setSuccessMessage("Pedido marcado como entregue com sucesso!");
      setSuccessModalShow(true);
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar status do pedido:", error);
    setWarningMessage("Erro ao atualizar status do pedido");
    setWarningModalShow(true);
  } finally {
    setUpdatingOrderId(null);
  }
};

  const handleSalvarAlteracoes = async (data: FormData) => {
    if (!selectPedido) return;

    setLoading(true);
    try {
      const orderDate = data.orderDate
        ? new Date(data.orderDate.toString()).toISOString()
        : selectPedido.orderDate
        ? new Date(selectPedido.orderDate).toISOString()
        : undefined;

      const deliveryDate = data.deliveryDate
        ? new Date(data.deliveryDate.toString()).toISOString()
        : selectPedido.deliveryDate
        ? new Date(selectPedido.deliveryDate).toISOString()
        : undefined;

      const formattedData = {
        status: data.status,
        deliveryDate: data.deliveryDate
          ? new Date(data.deliveryDate.toString()).toISOString()
          : selectPedido.deliveryDate,
        orderDate: data.orderDate
          ? new Date(data.orderDate.toString()).toISOString()
          : selectPedido.orderDate,
        notes: data.notes || "",
      };

      console.log("Enviando atualização do pedido:", formattedData);

      const response = await api.put(
        `/orders/${selectPedido.id}`,
        formattedData
      );
      console.log("Pedido atualizado:", response.data);

      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === selectPedido.id ? response.data : pedido
        )
      );

      setSuccessMessage("Pedido atualizado com sucesso!");
      setSuccessModalShow(true);
      handleCloseEditModal();
    } catch (error: any) {
      console.error("❌ Erro ao atualizar pedido:", error);

      if (error.response) {
        const errorData = error.response.data;
        setWarningMessage(
          errorData.error || "Erro ao atualizar pedido. Tente novamente."
        );
      } else {
        setWarningMessage(
          "Erro de conexão. Verifique se o servidor está rodando."
        );
      }

      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (pedido: Order) => {
    setSelectPedido(pedido);
    setModalEditShow(true);
  };

  const handleOpenCancelModal = (pedido: Order) => {
    setPedidoToCancel(pedido);
    setWarningMessage("Deseja realmente cancelar este pedido?");
    setWarningDeleteModalShow(true);
  };

  const handleConfirmCancel = async () => {
    if (!pedidoToCancel) return;

    await handleUpdateOrderStatus(pedidoToCancel.id, "CANCELLED");
    setWarningDeleteModalShow(false);
    setPedidoToCancel(undefined);
  };

  const handleCloseCancelModal = () => {
    setWarningDeleteModalShow(false);
    setPedidoToCancel(undefined);
  };

  const handleOpenDeliveredModal = (pedido: Order) => {
    setPedidoToDelivered(pedido);
    setWarningMessage("Esse pedido realmente foi entregue?");
    setWarningDeliveredModalShow(true);
  };

  const handleConfirmDelivered = async () => {
    if (!pedidoToDelivered) return;

    await handleUpdateOrderStatus(pedidoToDelivered.id, "DELIVERED");
    setWarningDeliveredModalShow(false);
    setPedidoToDelivered(undefined);
  };

  const handleCloseDeliveredModal = () => {
    setWarningDeliveredModalShow(false);
    setPedidoToDelivered(undefined);
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
    setCustomerSearchTerm("");
    setProductSearchTerm("");
  };

  const handleCloseEditModal = () => {
    setModalEditShow(false);
    setSelectPedido(undefined);
  };

  const handleAddProduct = (product: {
    id: number;
    name: string;
    salePrice: number;
  }) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
          productName: product.name,
          unitPrice: product.salePrice,
        },
      ];
    });
    setProductSearchTerm(""); // Limpa a pesquisa após adicionar
  };

  const handleAddQuantity = (productId: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return prev;
    });
  };

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

  const formatDeliveryDate = (dateString: string): string | null => {
    if (!dateString) return null;

    try {
      if (dateString.includes("T")) {
        return dateString;
      }

      const date = new Date(dateString);

      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      return null;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return null;
    }
  };

  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (!selectedCustomer) {
        setWarningMessage("Selecione um cliente antes de cadastrar o pedido.");
        setWarningModalShow(true);
        setLoading(false);
        return;
      }

      if (!data.orderDate) {
        setWarningMessage("A data do pedido é obrigatória.");
        setWarningModalShow(true);
        setLoading(false);
        return;
      }

      const formattedOrderDate = formatDeliveryDate(String(data.orderDate));
      if (!formattedOrderDate) {
        setWarningMessage("Data do pedido inválida.");
        setWarningModalShow(true);
        setLoading(false);
        return;
      }

      if (orderItems.length === 0) {
        setWarningMessage("Adicione pelo menos um produto ao pedido.");
        setWarningModalShow(true);
        setLoading(false);
        return;
      }

      const items = orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const formattedDeliveryDate = data.deliveryDate
        ? formatDeliveryDate(String(data.deliveryDate))
        : null;

      const formattedData = {
        customerId: selectedCustomer.id,
        orderDate: formattedOrderDate,
        deliveryDate: formattedDeliveryDate,
        status: "PENDING",
        notes: data.notes || "",
        items: items,
        discount: (parseFloat(discount.toFixed(2))) || 0
      };

      console.log("Enviando pedido:", formattedData);

      const response = await api.post("/orders", formattedData);
      console.log("Pedido cadastrado:", response.data);

      setOrderItems([]);
      setDiscount(0);
      fetchPedidos();
      setSuccessMessage("Pedido cadastrado com sucesso!");
      setSuccessModalShow(true);
      handleCloseModal();
    } catch (error: any) {
      console.error("Erro ao cadastrar Pedido:", error);

      if (error.response) {
        const errorData = error.response.data;
        console.error("Detalhes do erro:", errorData);

        if (error.response.status === 400) {
          setWarningMessage(
            errorData.error ||
              "Dados inválidos. Verifique as informações do pedido."
          );
        } else {
          setWarningMessage(
            `Erro ${error.response.status}: ${
              errorData.message || "Erro ao cadastrar pedido"
            }`
          );
        }
      } else if (error.request) {
        setWarningMessage(
          "Erro de conexão. Verifique se o servidor está rodando."
        );
      } else {
        setWarningMessage("Erro inesperado. Tente novamente.");
      }

      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };
  const calculateSubtotal = () => {
  return orderItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
};

const calculateTotal = () => {
  const subtotal = calculateSubtotal();
  const totalWithDiscount = subtotal - discount;
  return Math.max(totalWithDiscount, 0); // Garante que não fique negativo
};

  if (loading && pedidos.length === 0) {
    return <div className={styles.loadingContainer}>Carregando pedidos...</div>;
  }

  return (
    <>
      <div className={styles.containerPrincipal}>
        {pedidos.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Nenhum pedido encontrado</h3>
            <p>Crie seu primeiro pedido para começar</p>
          </div>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className={styles.divContainerCliente}>
              <CardOrder
                title={p.customer?.name ?? "Cliente desconhecido"}
                order={p}
                loading={updatingOrderId === p.id}
                onStatusUpdate={handleUpdateOrderStatus}
                onDeliveredClick={() => handleOpenDeliveredModal(p)}
                actions={[
                  ...(p.status === "IN_PRODUCTION" || p.status === "PENDING"
                    ? [
                        {
                          label: (
                            <div className={styles.botaoeditar}>
                              <PencilIcon size={18} />
                              <span>Editar</span>
                            </div>
                          ),
                          onClick: () => handleEditOrder(p),
                          variant: "edit"
                        },
                      ]
                    : []),
                  {
                    label: (
                      <div className={styles.botaonotafiscal}>
                        <ReceiptIcon size={18} />
                        <span>Nota Fiscal</span>
                      </div>
                    ),
                    onClick: () => gerarNotaFiscal(p),
                    variant: "notaFiscal"
                  },
                  ...(p.status !== "CANCELLED" && p.status !== "DELIVERED"
                    ? [
                        {
                          label: (
                            <div className={styles.botaocancelar}>
                              <ReceiptXIcon size={18} />
                              <span>Cancelar</span>
                            </div>
                          ),
                          onClick: () => handleOpenCancelModal(p),
                          variant: "cancel"
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          ))
        )}
      </div>

      {/* MODAL PRINCIPAL - CRIAR PEDIDO */}
<Modal show={modalShow} onHide={handleCloseModal} size="lg" centered>
  <Modal.Body className={styles.modalPedidosBody}>
    {/* Selecionar cliente - mantém igual */}
    {formStep === "checkCustomer" && (
      <div className={styles.searchContainer}>
        <h4>Selecione um cliente</h4>
        <div className={styles.searchWrapper}>
          <MagnifyingGlassIcon className={styles.searchIcon} width={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar cliente..."
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            onFocus={() => setIsCustomerSearchFocused(true)}
            onBlur={() =>
              setTimeout(() => setIsCustomerSearchFocused(false), 200)
            }
          />
        </div>

        {isCustomerSearchFocused && (
          <div className={styles.containerResults}>
            {customers
              .filter((c) =>
                c.name
                  .toLowerCase()
                  .includes(customerSearchTerm.toLowerCase())
              )
              .slice(0, 10)
              .map((c) => (
                <div
                  key={c.id}
                  className={styles.searchItem}
                  onMouseDown={() => {
                    setSelectedCustomer(c);
                    setFormStep("selectProducts");
                    setCustomerSearchTerm("");
                  }}
                >
                  {c.name}
                </div>
              ))}
          </div>
        )}
      </div>
    )}

    {/* Selecionar produtos - ATUALIZADO com desconto */}
    {formStep === "selectProducts" && selectedCustomer && (
      <div className={styles.productSelectionContainer}>
        <h4>Selecione os produtos para {selectedCustomer.name}</h4>

        {/* Barra de pesquisa de produtos */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <MagnifyingGlassIcon
              className={styles.searchIcon}
              width={20}
            />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar produto..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              onFocus={() => setIsProductSearchFocused(true)}
              onBlur={() =>
                setTimeout(() => setIsProductSearchFocused(false), 200)
              }
            />
          </div>

          {isProductSearchFocused && productSearchTerm && (
            <div className={styles.containerResults}>
              {filteredProducts
                .sort((a, b) => a.name.localeCompare(b.name))
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className={styles.searchItem}
                    onMouseDown={() => handleAddProduct(product)}
                  >
                    <div className={styles.searchItemContent}>
                      <div className={styles.productName}>
                        {product.name}
                      </div>
                      <div className={styles.searchItemAdd}>
                        <div className={styles.productPrice}>
                          R$ {product.salePrice.toFixed(2)}
                        </div>
                        <PlusIcon size={20} className={styles.addIcon} />
                      </div>
                    </div>
                  </div>
                ))}
              {filteredProducts.length === 0 && productSearchTerm && (
                <div className={styles.noResults}>
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de produtos adicionados */}
        {orderItems.length > 0 && (
          <div className={styles.selectedProducts}>
            <h5>Produtos Selecionados</h5>
            {orderItems.map((item) => (
              <div
                key={item.productId}
                className={styles.selectedProductItem}
              >
                <div className={styles.productInfo}>
                  <span className={styles.productName}>
                    {item.productName}
                  </span>
                  <span className={styles.productPrice}>
                    R$ {item.unitPrice.toFixed(2)}
                  </span>
                </div>
                <div className={styles.quantityControls}>
                  <button
                    className={styles.btnQuantity}
                    onClick={() => handleRemoveQuantity(item.productId)}
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span className={styles.quantityValue}>
                    {item.quantity}
                  </span>
                  <button
                    className={styles.btnQuantity}
                    onClick={() => handleAddQuantity(item.productId)}
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  R$ {(item.unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            {/* NOVO: Campo de desconto */}
            <div className={styles.discountSection}>
              <label className={styles.discountLabel}>
                Desconto (Atacado):
              </label>
              <div className={styles.discountInputWrapper}>
                <span className={styles.currencySymbol}>R$</span>
                <input
                  type="text"
                  step="0.01"
                  min="0"
                  max={calculateSubtotal()} 
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className={styles.discountInput}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className={styles.partialTotal}>
              <div className={styles.totalLine}>
                <span>Subtotal:</span>
                <span>R$ {calculateSubtotal().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className={styles.totalLine}>
                  <span>Desconto:</span>
                  <span className={styles.discountText}>
                    - R$ {discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={styles.totalLine}>
                <strong>Total:</strong>
                <strong>R$ {calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}

        <div className={styles.productsActions}>
          <Button
            variant="secondary"
            onClick={() => {
              setFormStep("checkCustomer");
              setSelectedCustomer(null);
              setOrderItems([]);
              setDiscount(0); // Reseta o desconto ao voltar
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

    {formStep === "order" && selectedCustomer && (
      <Card
        title={`Cadastro de Pedido — ${selectedCustomer.name}`}
        fields={[
          {
            name: "orderDate",
            label: "Data do Pedido",
            type: "date",
            value: new Date().toISOString().split("T")[0],
            readOnly: true,
          },
          {
            name: "deliveryDate",
            label: "Data de Entrega",
            type: "date",
            value: "",
          },
          {
            name: "notes",
            label: "Observações",
            type: "text",
            value: "",
          },
        ]}
        onSubmit={handleSubmit}
        submitLabel="Cadastrar Pedido"
        loading={loading}
        showCancel
        onCancel={() => setFormStep("selectProducts")}
        additionalInfo={
          <div className={styles.orderSummaryContainer}>
            <button
              className={styles.orderSummaryToggle}
              type="button"
              onClick={() => setShowSummary((prev) => !prev)}
            >
              {showSummary
                ? "Ocultar Resumo do Pedido"
                : "Mostrar Resumo do Pedido"}
            </button>

            {showSummary && (
              <div className={styles.orderSummaryCard}>
                <h5>Resumo do Pedido</h5>
                {orderItems.map((item) => (
                  <div key={item.productId} className={styles.orderItem}>
                    <span>{item.productName}</span> —
                    <span> Qtd: {item.quantity}</span>
                    <br />
                    <span>R$ {item.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
                {discount > 0 && (
                  <div className={styles.orderDiscount}>
                    <span>Desconto aplicado:</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            <br />
            <div className={styles.finalTotal}>
              <strong>Total: R$ {calculateTotal().toFixed(2)}</strong>
            </div>
          </div>
        }
      />
    )}
  </Modal.Body>
</Modal>

      {/* Modal de confirmação de cancelamento */}
      <Modal
        show={warningDeleteModalShow}
        onHide={handleCloseCancelModal}
        size="sm"
        centered
      >
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#ffc107" }}>
            ⚠️
          </div>
          <h5>
            <strong>Atenção</strong>
          </h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar
            variant="outline"
            onClick={handleCloseCancelModal}
            CancelLabel="Cancelar"
          />
          <Button variant="danger" onClick={handleConfirmCancel}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação de entrega */}
      <Modal
        show={warningDeliveredModalShow}
        onHide={handleCloseDeliveredModal}
        size="sm"
        centered
      >
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#28a745" }}>
            ✓
          </div>
          <h5>
            <strong>Confirmar Entrega</strong>
          </h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar
            variant="outline"
            onClick={handleCloseDeliveredModal}
            CancelLabel="Voltar"
          />
          <Button variant="success" onClick={handleConfirmDelivered}>
            Confirmar Entrega
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE EDIÇÃO DE PEDIDO */}
      {selectPedido && (
        <Modal
          show={modalEditShow}
          onHide={handleCloseEditModal}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Editar Pedido #{selectPedido.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles.modalBodyEdit}>
            <Card
              key={selectPedido.id}
              title={
                `Pedido de ${selectPedido?.customer?.name}` ||
                "Cliente não informado"
              }
              fields={[
                {
                  name: "status",
                  value: selectPedido.status || "PENDING",
                  label: "Status do Pedido",
                  type: "select",
                  options: [
                    { value: "IN_PRODUCTION", label: "Em Produção" },
                    {
                      value: "READY_FOR_DELIVERY",
                      label: "Pronto para Entrega",
                    },
                    { value: "DELIVERED", label: "Entregue" },
                    { value: "CANCELLED", label: "Cancelado" },
                  ],
                },
                {
                  name: "orderDate",
                  value: selectPedido.orderDate
                    ? new Date(selectPedido.orderDate)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  label: "Data do Pedido",
                  type: "date",
                },
                {
                  name: "deliveryDate",
                  value: selectPedido.deliveryDate
                    ? new Date(selectPedido.deliveryDate)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  label: "Data de Entrega",
                  type: "date",
                },
                {
                  name: "notes",
                  value: selectPedido.notes || "",
                  label: "Observações",
                  type: "textarea",
                  placeholder: "Observações sobre o pedido...",
                },
              ]}
              showCancel
              onCancel={handleCloseEditModal}
              onSubmit={handleSalvarAlteracoes}
              submitLabel="Salvar Alterações"
              loading={loading}
              additionalInfo={
                <div className={styles.pedidoInfoAdicional}>
                  <h6>Informações do Cliente</h6>
                  <div className={styles.clienteInfo}>
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {selectPedido.customer?.name || "N/A"}
                    </p>
                    {selectPedido.customer?.contact && (
                      <p>
                        <strong>Telefone:</strong>{" "}
                        {selectPedido.customer.contact}
                      </p>
                    )}
                  </div>

                  {selectPedido.items && selectPedido.items.length > 0 && (
                    <div className={styles.itensPedido}>
                      <h6>Itens do Pedido</h6>
                      <div className={styles.itensList}>
                        {selectPedido.items.map((item, index) => (
                          <div key={index} className={styles.itemRow}>
                            <span className={styles.itemQuantity}>
                              {item.quantity}x{" "}
                            </span>
                            <span className={styles.itemName}>
                              {item.product?.name || "Produto não encontrado"} -{" "}
                            </span>
                            <span className={styles.itemPrice}>
                              R${" "}
                              {typeof item.unitPrice === "number"
                                ? item.unitPrice.toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.totalPedido}>
                        <strong>
                          Total do Pedido: R${" "}
                          {selectPedido.total?.toFixed(2) || "0.00"}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          </Modal.Body>
        </Modal>
      )}

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
