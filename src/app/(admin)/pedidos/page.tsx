"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import CardOrder from "@/components/Cards/CardPedidos";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FAB from "@/components/FAB";
import api from "@/services/api";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  ReceiptIcon,
  ReceiptXIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import Order from "@/models/order";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import { useSearchParams } from "next/navigation";
import { PageActions } from "@/contexts/PageActions";
import toast from 'react-hot-toast'; // <-- importação do toast

export default function PedidosPage() {
  const [modalShow, setModalShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  // Removidos: successModalShow, successMessage, warningModalShow, warningMessage
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [warningDeleteModalShow, setWarningDeleteModalShow] = useState(false);
  const [warningDeliveredModalShow, setWarningDeliveredModalShow] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [formStep, setFormStep] = useState<"checkCustomer" | "selectProducts" | "order">("checkCustomer");

  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [selectPedido, setSelectPedido] = useState<Order>();
  const [pedidoToCancel, setPedidoToCancel] = useState<Order>();
  const [pedidoToDelivered, setPedidoToDelivered] = useState<Order>();
  const [deliveryDateInput, setDeliveryDateInput] = useState<string>("");
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<{ id: number; name: string; salePrice: number }[]>([]);

  const [products, setProducts] = useState<{ id: number; name: string; salePrice: number }[]>([]);

  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number; productName: string; unitPrice: number }[]>([]);

  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get("highlight");
  const { setShowAddButton, setHandleAdd, setShowFilterButton, setFilterOptions, setHandleFilter } = useContext(PageActions);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Advanced Date Filters States
  const [filterMode, setFilterMode] = useState<"all" | "day" | "week" | "month">("all");
  const [selectedDateDay, setSelectedDateDay] = useState<string>(() => {
    const today = new Date();
    const parts = today.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split("/");
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  });
  
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay(); // 0 = Domingo
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };
  const getEndOfWeek = (d: Date) => {
    const date = new Date(d);
    date.setHours(23, 59, 59, 999);
    const start = getStartOfWeek(date);
    return new Date(start.setDate(start.getDate() + 6));
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedMonthYear, setSelectedMonthYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthWeekIdx, setSelectedMonthWeekIdx] = useState<number | null>(null);

  const getWeeksInMonth = (month: number, year: number) => {
    const weeks = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let currentStart = getStartOfWeek(firstDayOfMonth);

    while (currentStart <= lastDayOfMonth) {
      const currentEnd = getEndOfWeek(new Date(currentStart));
      // Recorta o início e o fim da semana para os limites do mês
      const clampedStart = currentStart < firstDayOfMonth ? new Date(firstDayOfMonth) : new Date(currentStart);
      const clampedEnd = currentEnd > lastDayOfMonth ? new Date(lastDayOfMonth) : new Date(currentEnd);
      weeks.push({ start: clampedStart, end: clampedEnd, rawStart: new Date(currentStart), rawEnd: new Date(currentEnd) });
      currentStart = new Date(currentStart);
      currentStart.setDate(currentStart.getDate() + 7);
    }
    return weeks;
  };

  // Para o filtro de semana: semanas do mês em que currentWeekStart se encontra
  const weekFilterMonth = currentWeekStart.getMonth();
  const weekFilterYear = currentWeekStart.getFullYear();
  const weeksInCurrentMonth = getWeeksInMonth(weekFilterMonth, weekFilterYear);

  // Computa a lista filtrada
  const pedidosFiltrados = pedidos.filter((p) => {
    // 1. Filtro por Status
    if (activeFilter !== "all" && p.status !== activeFilter) {
      return false;
    }

    // 2. Filtro por Data
    if (filterMode === "all") return true;

    const orderDateStr = p.orderDate ? p.orderDate.toString() : "";
    if (!orderDateStr) return false;

    // Extrai a data como local, sem conversão de fuso.
    // Se vier como "YYYY-MM-DD" ou "YYYY-MM-DDT..." pega só a parte da data.
    const datePart = orderDateStr.substring(0, 10); // "YYYY-MM-DD"
    const [py, pm, pd] = datePart.split("-").map(Number);
    // Cria um Date local (sem UTC) para comparações
    const localDate = new Date(py, pm - 1, pd);

    if (filterMode === "day") {
      const [y, m, d] = selectedDateDay.split("-").map(Number);
      return localDate.getFullYear() === y && localDate.getMonth() === (m - 1) && localDate.getDate() === d;
    }

    if (filterMode === "week") {
      const start = getStartOfWeek(currentWeekStart);
      const end = getEndOfWeek(currentWeekStart);
      return localDate >= start && localDate <= end;
    }

    if (filterMode === "month" && selectedMonth !== null) {
      const currentYear = selectedMonthYear;
      
      if (selectedMonthWeekIdx !== null) {
        // Filtra pela semana específica dentro do mês (usando rawStart/rawEnd para não perder dias)
        const weeks = getWeeksInMonth(selectedMonth, currentYear);
        if (weeks[selectedMonthWeekIdx]) {
          const { rawStart, rawEnd } = weeks[selectedMonthWeekIdx];
          return localDate >= rawStart && localDate <= rawEnd;
        }
      } else {
        // Filtro pelo mês inteiro
        return localDate.getFullYear() === currentYear && localDate.getMonth() === selectedMonth;
      }
    }

    return true;
  });

  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "DELIVERED", label: "Entregue" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  useEffect(() => {
    if (highlightOrderId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`order-${highlightOrderId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          const url = new URL(window.location.href);
          url.searchParams.delete("highlight");
          window.history.replaceState({}, "", url.toString());
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightOrderId, pedidos]);

  useEffect(() => {
    setShowAddButton(true);
    setHandleAdd(() => setModalShow(true));

    setShowFilterButton(true);
    setFilterOptions([
      { label: "Todos", value: "all" },
      { label: "Pendentes", value: "PENDING" },
      { label: "Em Produção", value: "IN_PRODUCTION" },
      { label: "Entregues", value: "DELIVERED" },
      { label: "Cancelados", value: "CANCELLED" },
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

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearchTerm, products]);

  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const gerarNotaFiscal = async (pedido: Order) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Brand colors
    const brandDark = [46, 28, 28] as const;   // #2e1c1c
    const brandAccent = [212, 123, 146] as const; // #d47b92
    const textDark = [33, 37, 41] as const;    // #212529
    const textMuted = [108, 117, 125] as const; // #6c757d
    const lineColor = [222, 226, 230] as const; // #dee2e6

    // Header band
    doc.setFillColor(...brandDark);
    doc.rect(0, 0, 210, 32, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SANT'SAPORE", 20, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...brandAccent);
    doc.text("Doces Sabor Confeitaria", 20, 26);

    // RECIBO label
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("RECIBO", 190, 20, { align: "right" });

    // Company info
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text("CNPJ: 26.378.162/0001-51  |  Rua Riachuelo, 795 - Centro  |  São Carlos - SP  |  (16) 99750-9099", 20, 40);

    // Divider
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.5);
    doc.line(20, 44, 190, 44);

    // Client + Order Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("CLIENTE", 20, 52);
    doc.text("PEDIDO", 120, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...textDark);
    doc.text(`${pedido.customer?.name || "Não informado"}`, 20, 59);

    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text(`Tel: ${pedido.customer?.contact || "Não informado"}`, 20, 65);
    doc.text(`End: ${pedido.customer?.address || "Não informado"}`, 20, 71);

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.text(`Data: ${pedido.orderDate ? formatDateForDisplay(pedido.orderDate.toString()) : "A combinar"}`, 120, 59);
    doc.text(`Entrega: ${pedido.deliveryDate ? formatDateForDisplay(pedido.deliveryDate.toString()) : "A combinar"}`, 120, 65);

    // Divider
    doc.line(20, 76, 190, 76);

    // Items header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandDark);
    doc.text("ITENS DO PEDIDO", 20, 84);

    // Table header
    doc.setFillColor(248, 249, 250);
    doc.rect(20, 88, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text("Produto", 22, 93);
    doc.text("Qtd", 130, 93);
    doc.text("Unit.", 148, 93);
    doc.text("Subtotal", 170, 93);

    let yPosition = 101;

    const subtotalItens = pedido.items?.reduce((total, item) => total + (item.subtotal || 0), 0) || 0;
    const desconto = pedido.discount || 0;
    const totalFinal = pedido.total || subtotalItens - desconto;

    pedido.items?.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(252, 251, 250);
        doc.rect(20, yPosition - 5, 170, 8, "F");
      }

      const nome = item.product?.name || "Produto não encontrado";
      const qtd = item.quantity || 0;
      const unit = item.unitPrice || 0;
      const sub = item.subtotal || qtd * unit;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...textDark);
      doc.text(nome, 22, yPosition);
      doc.text(String(qtd), 133, yPosition, { align: "right" });
      doc.text(formatCurrency(unit), 148, yPosition);
      doc.text(formatCurrency(sub), 170, yPosition);

      yPosition += 8;
    });

    yPosition += 6;
    doc.setDrawColor(...lineColor);
    doc.line(120, yPosition, 190, yPosition);

    // Totals
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text("Subtotal:", 120, yPosition + 8);
    doc.text(formatCurrency(subtotalItens), 170, yPosition + 8);

    if (desconto > 0) {
      doc.setTextColor(220, 53, 69);
      doc.text("Desconto:", 120, yPosition + 16);
      doc.text(`- ${formatCurrency(desconto)}`, 170, yPosition + 16);
    }

    const totalY = desconto > 0 ? yPosition + 26 : yPosition + 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...brandDark);
    doc.text("TOTAL:", 120, totalY);
    doc.text(formatCurrency(totalFinal), 170, totalY);

    // Notes
    if (pedido.notes) {
      const obsStart = totalY + 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...brandDark);
      doc.text("OBSERVAÇÕES:", 20, obsStart);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textMuted);
      const splitNotes = doc.splitTextToSize(pedido.notes, 170);
      doc.text(splitNotes, 20, obsStart + 7);
    }

    // Footer
    const footerY = 280;
    doc.setFillColor(...brandDark);
    doc.rect(0, footerY - 12, 210, 20, "F");
    doc.setFontSize(8);
    doc.setTextColor(...brandAccent);
    doc.text("Agradecemos pela preferência!", 105, footerY - 3, { align: "center" });
    doc.setTextColor(200, 200, 200);
    doc.text("SANT'SAPORE — Doces Sabor Confeitaria  |  santsapore.com.br", 105, footerY + 4, { align: "center" });

    doc.save(`recibo-pedido-${pedido.id}.pdf`);
  };

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      const sortedOrders = response.data.sort((a: Order, b: Order) => b.id - a.id);
      setPedidos(sortedOrders);
    } catch (error: any) {
      console.error("Erro ao buscar pedidos:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para visualizar Pedidos.", { id: "page_error" });
      } else {
        toast.error("Erro ao carregar os pedidos cadastrados.", { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateForBackend = (dateString: string): string => {
    if (!dateString) return "";
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Data inválida:", dateString);
        return "";
      }
      return getLocalDateString(date);
    } catch (error) {
      console.error("Erro ao processar data:", error);
      return "";
    }
  };

  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return "Não definida";
    try {
      // Se vier como "YYYY-MM-DD", interpreta como data local (sem conversão de fuso)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    } catch (error) {
      console.error("Erro ao formatar data para exibição:", error);
      return "Data inválida";
    }
  };

  const handleRemoveFromProduction = async (orderId: number) => {
    try {
      console.log(`🔄 Removendo pedido ${orderId} da produção...`);
      const response = await api.post(`/task/${orderId}/remove-from-production`);
      console.log(`✅ Pedido ${orderId} removido da produção:`, response.data);
      return { success: true, message: "Pedido removido da produção" };
    } catch (error: any) {
      console.error(`Erro ao remover pedido ${orderId} da produção:`, error);
      if (error.response?.status === 404) {
        console.log(`Pedido ${orderId} não estava na produção`);
        return { success: true, message: "Pedido não estava na produção" };
      }
      throw new Error(error.response?.data?.message || "Erro ao remover da produção");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await api.put(`/orders/atualiza-status/${orderId}`, { status: newStatus });

      setPedidos((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
            : order
        )
      );

      console.log(`✅ Pedido ${orderId} marcado como ${newStatus}`);

      if (newStatus === "CANCELLED") {
        try {
          setTimeout(async () => {
            await handleRemoveFromProduction(orderId);
            console.log(`🗑️ Pedido ${orderId} removido da produção após cancelamento`);
          }, 1000);
        } catch (productionError) {
          console.error(`Aviso: Não foi possível remover pedido ${orderId} da produção:`, productionError);
        }
      }

      if (newStatus === "DELIVERED") {
        toast.success("Pedido marcado como entregue com sucesso!"); // <-- substituído
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      toast.error("Erro ao atualizar status do pedido"); // <-- substituído
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSalvarAlteracoes = async (data: FormData) => {
    if (!selectPedido) return;

    setLoading(true);
    try {
      const formattedOrderDate = data.orderDate
        ? handleDateForBackend(String(data.orderDate))
        : selectPedido.orderDate
        ? handleDateForBackend(String(selectPedido.orderDate))
        : "";

      const formattedDeliveryDate = data.deliveryDate
        ? handleDateForBackend(String(data.deliveryDate))
        : selectPedido.deliveryDate
        ? handleDateForBackend(String(selectPedido.deliveryDate))
        : null;

      const formattedData = {
        status: data.status,
        deliveryDate: formattedDeliveryDate,
        orderDate: formattedOrderDate,
        notes: data.notes || "",
      };

      console.log("Enviando atualização do pedido:", formattedData);

      const response = await api.put(`/orders/${selectPedido.id}`, formattedData);
      console.log("Pedido atualizado:", response.data);

      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => (pedido.id === selectPedido.id ? response.data : pedido))
      );

      toast.success("Pedido atualizado com sucesso!"); // <-- substituído
      handleCloseEditModal();
    } catch (error: any) {
      console.error("Erro ao atualizar pedido:", error);
      if (error.response) {
        const errorData = error.response.data;
        toast.error(errorData.error || "Erro ao atualizar pedido. Tente novamente."); // <-- substituído
      } else {
        toast.error("Erro de conexão. Verifique se o servidor está funcionando."); // <-- substituído
      }
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
    setWarningDeliveredModalShow(true);
    
    // Set to today's date by default in Brasilia timezone
    const today = new Date();
    const parts = today.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split("/");
    setDeliveryDateInput(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
  };

  const handleConfirmDelivered = async () => {
    if (!pedidoToDelivered) return;
    setLoading(true);
    try {
      const formattedDeliveryDate = handleDateForBackend(deliveryDateInput);
      
      const payload = {
        status: "DELIVERED",
        deliveryDate: formattedDeliveryDate,
        orderDate: pedidoToDelivered.orderDate ? handleDateForBackend(String(pedidoToDelivered.orderDate)) : null,
        notes: pedidoToDelivered.notes || ""
      };

      const response = await api.put(`/orders/${pedidoToDelivered.id}`, payload);
      
      setPedidos((prevOrders) =>
        prevOrders.map((order) =>
          order.id === pedidoToDelivered.id ? response.data : order
        )
      );
      
      toast.success("Pedido entregue com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      toast.error("Erro ao registrar entrega. Tentando fallback apenas de status...");
      
      // Fallback
      await handleUpdateOrderStatus(pedidoToDelivered.id, "DELIVERED");
    } finally {
      setLoading(false);
      setWarningDeliveredModalShow(false);
      setPedidoToDelivered(undefined);
    }
  };

  const handleCloseDeliveredModal = () => {
    setWarningDeliveredModalShow(false);
    setPedidoToDelivered(undefined);
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Acesso restrito a clientes.", { id: "page_error" });
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const normalizedProducts = response.data.map((product: any) => ({
        ...product,
        salePrice: product.salePrice || 0,
      }));
      setProducts(normalizedProducts);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Acesso restrito a produtos.", { id: "page_error" });
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
    return () => {
      toast.dismiss("page_error");
    };
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

  const handleAddProduct = (product: { id: number; name: string; salePrice: number }) => {
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
          unitPrice: product.salePrice || 0,
        },
      ];
    });
    setProductSearchTerm("");
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
          i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const getQuantity = (productId: number) => {
    const item = orderItems.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (!selectedCustomer) {
        toast.error("Selecione um cliente antes de cadastrar o pedido."); // <-- substituído
        setLoading(false);
        return;
      }

      if (!data.orderDate) {
        toast.error("A data do pedido é obrigatória."); // <-- substituído
        setLoading(false);
        return;
      }

      const formattedOrderDate = handleDateForBackend(String(data.orderDate));
      const formattedDeliveryDate = data.deliveryDate
        ? handleDateForBackend(String(data.deliveryDate))
        : null;

      if (!formattedOrderDate) {
        toast.error("Data do pedido inválida."); // <-- substituído
        setLoading(false);
        return;
      }

      if (orderItems.length === 0) {
        toast.error("Adicione pelo menos um produto ao pedido."); // <-- substituído
        setLoading(false);
        return;
      }

      const items = orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const formattedData = {
        customerId: selectedCustomer.id,
        orderDate: formattedOrderDate,
        deliveryDate: formattedDeliveryDate,
        status: "PENDING",
        notes: data.notes || "",
        items: items,
        discount: parseFloat(discount.toFixed(2)) || 0,
      };

      console.log("Enviando pedido:", formattedData);

      const response = await api.post("/orders", formattedData);
      console.log("Pedido cadastrado:", response.data);

      setOrderItems([]);
      setDiscount(0);
      fetchOrders();
      toast.success("Pedido cadastrado com sucesso!"); // <-- substituído
      handleCloseModal();
    } catch (error: any) {
      console.error("Erro ao cadastrar Pedido:", error);

      if (error.response) {
        const errorData = error.response.data;
        console.error("Detalhes do erro:", errorData);

        if (error.response.status === 400) {
          toast.error(errorData.error || "Dados inválidos. Verifique as informações do pedido."); // <-- substituído
        } else {
          toast.error(`Erro ${error.response.status}: ${errorData.message || "Erro ao cadastrar pedido"}`); // <-- substituído
        }
      } else if (error.request) {
        toast.error("Erro de conexão. Verifique se o servidor está rodando."); // <-- substituído
      } else {
        toast.error("Erro inesperado. Tente novamente."); // <-- substituído
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalWithDiscount = subtotal - discount;
    return Math.max(totalWithDiscount, 0);
  };

  if (loading && pedidos.length === 0) {
    return <div className={styles.loadingContainer}>Carregando pedidos...</div>;
  }

  const getLocalDateString = (date: Date = new Date()): string => {
    // Usa o fuso de Brasília (America/Sao_Paulo) para formatar a data corretamente
    const parts = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split("/");
    // parts = [dd, mm, yyyy]
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  };

  const formatWeekRange = (start: Date) => {
    const end = getEndOfWeek(start);
    const m1 = String(start.getMonth() + 1).padStart(2, "0");
    const d1 = String(start.getDate()).padStart(2, "0");
    const m2 = String(end.getMonth() + 1).padStart(2, "0");
    const d2 = String(end.getDate()).padStart(2, "0");
    return `${d1}/${m1} até ${d2}/${m2}`;
  };

  const goToPreviousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    // Não permite navegar para fora do mês atual do filtro de semana
    const firstOfMonth = new Date(prev.getFullYear(), prev.getMonth(), 1);
    if (prev < firstOfMonth) {
      setCurrentWeekStart(getStartOfWeek(firstOfMonth));
    } else {
      setCurrentWeekStart(prev);
    }
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    // Não permite navegar para além do mês corrente do filtro
    const lastOfMonth = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 0);
    if (next > lastOfMonth) {
      // vai para o próximo mês, primeiro dia
      const firstNextMonth = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 1);
      setCurrentWeekStart(getStartOfWeek(firstNextMonth));
    } else {
      setCurrentWeekStart(next);
    }
  };

  const goToPreviousWeekMonth = () => {
    const d = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() - 1, 1);
    setCurrentWeekStart(getStartOfWeek(d));
  };

  const goToNextWeekMonth = () => {
    const d = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 1);
    setCurrentWeekStart(getStartOfWeek(d));
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Filtros de Data Avançados */}
        <div className={styles.advancedFiltersContainer}>
          <div className={styles.filterModeToggle}>
            <button className={`${styles.modeBtn} ${filterMode === "all" ? styles.activeMode : ""}`} onClick={() => setFilterMode("all")}>Todo o Período</button>
            <button className={`${styles.modeBtn} ${filterMode === "day" ? styles.activeMode : ""}`} onClick={() => setFilterMode("day")}>Dia</button>
            <button className={`${styles.modeBtn} ${filterMode === "week" ? styles.activeMode : ""}`} onClick={() => setFilterMode("week")}>Semana</button>
            <button className={`${styles.modeBtn} ${filterMode === "month" ? styles.activeMode : ""}`} onClick={() => setFilterMode("month")}>Mês</button>
          </div>

          {filterMode === "day" && (
            <div className={styles.subFilterRow}>
              <input 
                type="date" 
                value={selectedDateDay} 
                onChange={(e) => setSelectedDateDay(e.target.value)} 
                className={styles.dateInput} 
              />
            </div>
          )}

          {filterMode === "week" && (
            <div className={styles.monthFilterContainer}>
              {/* Navegação de mês */}
              <div className={styles.subFilterRow} style={{ marginBottom: "8px" }}>
                <button className={styles.navBtn} onClick={goToPreviousWeekMonth}>&lt;</button>
                <span className={styles.weekLabel} style={{ fontWeight: 600 }}>
                  {currentWeekStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" })}
                </span>
                <button className={styles.navBtn} onClick={goToNextWeekMonth}>&gt;</button>
              </div>
              {/* Semanas do mês */}
              <div className={styles.weekSubSelector}>
                {weeksInCurrentMonth.map((week, idx) => {
                  const isActive = currentWeekStart >= week.rawStart && currentWeekStart <= week.rawEnd;
                  const d1 = String(week.start.getDate()).padStart(2, "0");
                  const m1 = String(week.start.getMonth() + 1).padStart(2, "0");
                  const d2 = String(week.end.getDate()).padStart(2, "0");
                  const m2 = String(week.end.getMonth() + 1).padStart(2, "0");
                  return (
                    <button
                      key={idx}
                      className={`${styles.weekBtn} ${isActive ? styles.activeWeekBtn : ""}`}
                      onClick={() => setCurrentWeekStart(new Date(week.rawStart))}
                    >
                      {`${d1}/${m1} - ${d2}/${m2}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filterMode === "month" && (
            <div className={styles.monthFilterContainer}>
              <div className={styles.monthSelector}>
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => (
                  <button 
                    key={i} 
                    className={`${styles.monthBtn} ${selectedMonth === i ? styles.activeMonthBtn : ""}`} 
                    onClick={() => { setSelectedMonth(i); setSelectedMonthWeekIdx(null); setSelectedMonthYear(new Date().getFullYear()); }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              
              {selectedMonth !== null && (
                <div className={styles.weekSubSelector}>
                  <button 
                    className={`${styles.weekBtn} ${selectedMonthWeekIdx === null ? styles.activeWeekBtn : ""}`} 
                    onClick={() => setSelectedMonthWeekIdx(null)}
                  >
                    Mês Inteiro
                  </button>
                  {getWeeksInMonth(selectedMonth, selectedMonthYear).map((week, idx) => {
                    const d1 = String(week.start.getDate()).padStart(2, "0");
                    const m1 = String(week.start.getMonth() + 1).padStart(2, "0");
                    const d2 = String(week.end.getDate()).padStart(2, "0");
                    const m2 = String(week.end.getMonth() + 1).padStart(2, "0");
                    return (
                      <button 
                        key={idx} 
                        className={`${styles.weekBtn} ${selectedMonthWeekIdx === idx ? styles.activeWeekBtn : ""}`} 
                        onClick={() => setSelectedMonthWeekIdx(idx)}
                      >
                        {`${d1}/${m1} - ${d2}/${m2}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="emptyStateStandard">
            <h3>
              {activeFilter !== "all"
                ? "Nenhum pedido encontrado para este filtro"
                : "Nenhum pedido encontrado"}
            </h3>
            <p>
              {activeFilter === "all"
                ? "Crie seu primeiro pedido para começar"
                : "Tente outro filtro"}
            </p>
          </div>
        ) : (
          pedidosFiltrados.map((p) => (
            <div key={p.id} id={`order-${p.id}`} className={styles.divContainerCliente}>
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
                          variant: "edit",
                        },
                      ]
                    : []),
                  {
                    label: (
                      <div className={styles.botaonotafiscal}>
                        <ReceiptIcon size={18} />
                        <span>Recibo</span>
                      </div>
                    ),
                    onClick: () => gerarNotaFiscal(p),
                    variant: "notaFiscal",
                  },
                  ...(p.status !== "CANCELLED" && p.status !== "DELIVERED"
                    ? [
                        {
                          label: (
                            <div className={styles.botaocancelar}>
                              <ReceiptXIcon size={18} />
                              <span style={{ marginLeft: "4px" }}>Cancelar</span>
                            </div>
                          ),
                          onClick: () => handleOpenCancelModal(p),
                          variant: "cancel",
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
      <Modal show={modalShow} onHide={handleCloseModal} size="xl" centered contentClassName={styles.modalContentRounded}>
        <Modal.Body className={styles.modalPedidosBody}>
          {formStep === "checkCustomer" && (
            <div className={styles.stepContainer}>
              <h4 className={styles.stepTitle}>Selecione o Cliente</h4>
              <p className={styles.stepSubtitle}>Busque e selecione o cliente para o qual deseja criar este pedido.</p>
              <div className={styles.searchWrapper}>
                <MagnifyingGlassIcon className={styles.searchIcon} width={18} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar cliente pelo nome..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                />
              </div>
              <div className={styles.listContainerFixedModal}>
                {customers
                  .filter((c) => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()))
                  .length === 0 ? (
                  <div className={styles.noResults}>Nenhum cliente encontrado com este nome.</div>
                ) : (
                  customers
                    .filter((c) => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()))
                    .map((c) => (
                      <div
                        key={c.id}
                        className={styles.listItem}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setFormStep("selectProducts");
                          setCustomerSearchTerm("");
                        }}
                      >
                        <span className={styles.listItemName}>{c.name}</span>
                        <div className={styles.listItemRight}>
                          <span className={styles.selectText}>Selecionar</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className={styles.productsActions}>
                <button
                  type="button"
                  className={styles.actionBtnBack}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {formStep === "selectProducts" && selectedCustomer && (
            <div className={styles.stepContainer}>
              <h4 className={styles.stepTitle}>
                Produtos para <span className={styles.stepTitleAccent}>{selectedCustomer.name}</span>
              </h4>
              <p className={styles.stepSubtitle}>Adicione produtos e defina a quantidade desejada.</p>

              {/* Layout Dividido para Produtos e Resumo */}
              <div className={styles.productsSplitLayout}>
                <div className={styles.productsLeft}>
                  <div className={styles.searchWrapper}>
                    <MagnifyingGlassIcon className={styles.searchIcon} width={18} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Buscar produto..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className={styles.listContainerFixedProduct}>
                    {filteredProducts.length === 0 ? (
                      <div className={styles.noResults}>Nenhum produto encontrado.</div>
                    ) : (
                      filteredProducts
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((product) => (
                          <div
                            key={product.id}
                            className={styles.listItem}
                            onClick={() => handleAddProduct(product)}
                          >
                            <span className={styles.listItemName}>{product.name}</span>
                            <div className={styles.listItemRight}>
                              <span className={styles.listItemPrice}>R$ {product.salePrice ? product.salePrice.toFixed(2) : "0,00"}</span>
                              <PlusIcon size={16} className={styles.listItemIcon} />
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className={styles.productsRight}>
                  <div className={styles.selectedSectionFixed}>
                    <div className={styles.selectedSectionHeader}>
                      <span className={styles.selectedSectionTitle}>Itens do Pedido</span>
                      <span className={styles.selectedCount}>{orderItems.length} itens</span>
                    </div>
                    
                    <div className={styles.selectedItemsScroll}>
                      {orderItems.length === 0 ? (
                        <div className={styles.noResultsItems}>
                          <p>Nenhum produto adicionado.</p>
                          <span>Clique no "+" ao lado dos produtos na lista para adicionar.</span>
                        </div>
                      ) : (
                        orderItems.map((item) => (
                          <div key={item.productId} className={styles.selectedProductItemCompact}>
                            <div className={styles.productInfoCompact}>
                              <span className={styles.productName}>{item.productName}</span>
                              <span className={styles.productPrice}>R$ {item.unitPrice ? item.unitPrice.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className={styles.quantityControlsCompact}>
                              <button className={styles.btnQuantityCompact} onClick={() => handleRemoveQuantity(item.productId)}>
                                <MinusIcon size={12} weight="bold" />
                              </button>
                              <span className={styles.quantityValueCompact}>{item.quantity}</span>
                              <button className={styles.btnQuantityCompact} onClick={() => handleAddQuantity(item.productId)}>
                                <PlusIcon size={12} weight="bold" />
                              </button>
                            </div>
                            <div className={styles.itemTotalCompact}>
                              R$ {((item.unitPrice || 0) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className={styles.orderTotalsBarCompact}>
                      <div className={styles.totalsGroupCompact}>
                        <div className={styles.totalsRow}>
                          <span className={styles.totalsLabel}>Subtotal</span>
                          <span className={styles.totalsValue}>R$ {calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className={styles.totalsRow}>
                          <span className={styles.totalsLabel}>Desconto (R$)</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={calculateSubtotal()}
                            value={discount || ""}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className={styles.discountInputCompact}
                            placeholder="0.00"
                          />
                        </div>
                        <div className={styles.totalsRowFinal}>
                          <span className={styles.totalsLabelFinal}>Total</span>
                          <span className={styles.totalsValueFinal}>R$ {calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.productsActions}>
                <button
                  type="button"
                  className={styles.actionBtnBack}
                  onClick={() => { setFormStep("checkCustomer"); setSelectedCustomer(null); setOrderItems([]); setDiscount(0); }}
                >
                  <ArrowLeftIcon size={18} weight="bold" />
                  Voltar
                </button>
                <button
                  type="button"
                  className={styles.actionBtnNext}
                  onClick={() => setFormStep("order")}
                  disabled={orderItems.length === 0}
                >
                  Continuar
                  <ArrowRightIcon size={18} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {formStep === "order" && selectedCustomer && (
            <div className={styles.stepContainerFinal}>
              <h4 className={styles.stepTitle}>Finalizar Pedido</h4>
              <p className={styles.stepSubtitle}>Confirme os dados e informe as datas do pedido.</p>
              
              <div className={styles.finalStepLayout}>
                {/* Lado Esquerdo: Formulário */}
                <form 
                  className={`${styles.finalFormCol} ${styles.finalFormGrow}`} 
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const formElement = e.currentTarget;
                    const formData = new window.FormData(formElement);
                    handleSubmit({
                      orderDate: formData.get("orderDate") as string,
                      deliveryDate: formData.get("deliveryDate") as string,
                      notes: formData.get("notes") as string,
                    });
                  }}
                  id="finalOrderForm"
                >
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Data do Pedido</label>
                    <input 
                      type="date" 
                      name="orderDate" 
                      defaultValue={getLocalDateString()} 
                      readOnly 
                      className={styles.fieldInputReadOnly}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Data de Entrega</label>
                    <input 
                      type="date" 
                      name="deliveryDate" 
                      min={getLocalDateString()} 
                      className={styles.fieldInput} 
                      required
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                    <label className={styles.fieldLabel}>Observações (opcional)</label>
                    <textarea 
                      name="notes" 
                      className={`${styles.fieldTextarea} ${styles.fieldTextareaFull}`} 
                      placeholder="Instruções especiais..."
                    />
                  </div>
                </form>

                {/* Lado Direito: Resumo Visível sempre */}
                <div className={styles.finalSummaryCol}>
                  <div className={styles.orderSummaryPanel}>
                    <div className={styles.selectedSectionHeader}>
                      <span className={styles.selectedSectionTitle}>Resumo do Pedido</span>
                    </div>
                    <div className={styles.finalSummaryScroll}>
                      {orderItems.map((item) => (
                        <div key={item.productId} className={styles.orderSummaryRowFinal}>
                          <span className={styles.orderSummaryQtyFinal}>{item.quantity}x</span>
                          <span className={styles.orderSummaryProductNameFinal}>{item.productName}</span>
                          <span className={styles.orderSummaryPriceFinal}>R$ {((item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.orderSummaryFooterFinal}>
                      <div className={styles.summaryFooterRow}>
                        <span>Subtotal</span>
                        <span>R$ {calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className={`${styles.summaryFooterRow} ${styles.summaryFooterDiscount}`}>
                          <span>Desconto</span>
                          <span>− R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={styles.summaryFooterTotal}>
                        <span>Total a Pagar</span>
                        <span>R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.productsActions}>
                <button
                  type="button"
                  className={styles.actionBtnBack}
                  onClick={() => setFormStep("selectProducts")}
                  disabled={loading}
                >
                  <ArrowLeftIcon size={18} weight="bold" />
                  Voltar
                </button>
                <button
                  type="submit"
                  form="finalOrderForm"
                  className={`${styles.actionBtnNext} ${styles.actionBtnSubmit}`}
                  disabled={loading}
                >
                  {loading ? "Cadastrando..." : "Confirmar e Cadastrar"}
                  {!loading && <CheckCircleIcon size={18} weight="bold" />}
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de confirmação de cancelamento (mantido) */}
      <Modal show={warningDeleteModalShow} onHide={handleCloseCancelModal} size="sm" centered>
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#ffc107" }}>⚠️</div>
          <h5><strong>Atenção</strong></h5>
          <p>Deseja realmente cancelar este pedido?</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={handleCloseCancelModal} CancelLabel="Voltar" />
          <Button variant="danger" onClick={handleConfirmCancel}>Cancelar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação de entrega */}
      <Modal show={warningDeliveredModalShow} onHide={handleCloseDeliveredModal} size="sm" centered>
        <Modal.Body className="text-center">
          <div className="mb-3" style={{ fontSize: "48px", color: "#28a745" }}>✓</div>
          <h5><strong>Confirmar Entrega</strong></h5>
          <p>Esse pedido realmente foi entregue?</p>
          <div className="mb-3 text-start mt-4">
            <label htmlFor="deliveryDate" className="form-label" style={{ fontSize: "14px", fontWeight: "600", color: "#495057" }}>Data de Entrega:</label>
            <input
              id="deliveryDate"
              type="date"
              className="form-control"
              value={deliveryDateInput}
              onChange={(e) => setDeliveryDateInput(e.target.value)}
              style={{ borderRadius: "8px", border: "1px solid #ced4da" }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={handleCloseDeliveredModal} CancelLabel="Voltar" />
          <Button 
            variant="success" 
            onClick={handleConfirmDelivered} 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Confirmar Entrega"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE EDIÇÃO DE PEDIDO (mantido) */}
      {selectPedido && (
        <Modal show={modalEditShow} onHide={handleCloseEditModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Pedido #{selectPedido.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles.modalBodyEdit}>
            <Card
              key={selectPedido.id}
              title={`Pedido de ${selectPedido?.customer?.name}` || "Cliente não informado"}
              fields={[
                { name: "status", value: selectPedido.status || "PENDING", label: "Status do Pedido", type: "select", options: [
                    { value: "IN_PRODUCTION", label: "Em Produção" },
                    { value: "READY_FOR_DELIVERY", label: "Pronto para Entrega" },
                    { value: "DELIVERED", label: "Entregue" },
                    { value: "CANCELLED", label: "Cancelado" },
                  ] },
                { name: "orderDate", value: selectPedido.orderDate ? getLocalDateString(new Date(selectPedido.orderDate)) : getLocalDateString(), label: "Data do Pedido", type: "date" },
                { name: "deliveryDate", value: selectPedido.deliveryDate ? getLocalDateString(new Date(selectPedido.deliveryDate)) : "", label: "Data de Entrega", type: "date" },
                { name: "notes", value: selectPedido.notes || "", label: "Observações", type: "textarea", placeholder: "Observações sobre o pedido..." },
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
                    <p><strong>Cliente:</strong> {selectPedido.customer?.name || "N/A"}</p>
                    {selectPedido.customer?.contact && <p><strong>Telefone:</strong> {selectPedido.customer.contact}</p>}
                  </div>
                  {selectPedido.items && selectPedido.items.length > 0 && (
                    <div className={styles.itensPedido}>
                      <h6>Itens do Pedido</h6>
                      <div className={styles.itensList}>
                        {selectPedido.items.map((item, index) => (
                          <div key={index} className={styles.itemRow}>
                            <span className={styles.itemQuantity}>{item.quantity}x</span>
                            <span className={styles.itemName}>{item.product?.name || "Produto não encontrado"}</span>
                            <span className={styles.itemPrice}>R$ {typeof item.unitPrice === "number" ? (item.unitPrice * item.quantity).toFixed(2) : "0.00"}</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.totalPedido}>
                        <strong>Total: R$ {selectPedido.total?.toFixed(2) || "0.00"}</strong>
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

      {/* Modais de sucesso e aviso removidos */}
    </>
  );
}