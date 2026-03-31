"use client";

import React, { useContext, useEffect, useState } from "react";
import api from "@/services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import {
  CurrencyDollarIcon,
  UsersIcon,
  PackageIcon,
  TrendUpIcon,
  TrendDownIcon,
  ShoppingCartIcon,
  StarIcon,
  ExportIcon,
} from "@phosphor-icons/react";

// Importações do Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import Order from "@/models/order";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import { useRouter } from "next/navigation";
import { PageActions } from "@/contexts/PageActions";
import FixedExpense from '@/models/FixedExpenses';
import toast from "react-hot-toast";

// Registrando componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  topCustomer: {
    name: string;
    orderCount: number;
    totalSpent: number;
  };
  topProduct: {
    name: string;
    quantitySold: number;
    revenue: number;
  };
  leastSoldProduct: {
    name: string;
    quantitySold: number;
    revenue: number;
  };
  ordersByStatus: {
    pending: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyOrders: { month: string; count: number }[];
  productSales: { product: string; quantity: number; revenue: number }[];
  totalExpenses: number;
  monthlyExpenses: { month: string; total: number }[];
  expensesByCategory: { category: string; total: number }[];
}

export default function RelatoriosPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const router = useRouter();
  const pageActions = useContext(PageActions);

  useEffect(() => {
    pageActions.setShowAddButton(false);
  }, [pageActions]);

  // Fetch only once on mount
  useEffect(() => {
    fetchData();
    return () => {
      toast.dismiss("page_error");
    };
  }, []);

  // Re-process data when filters change, without re-fetching
  useEffect(() => {
    if (orders.length > 0 || customers.length > 0 || products.length > 0 || fixedExpenses.length > 0) {
      const processedData = processAnalyticsData(orders, customers, products, fixedExpenses);
      setAnalyticsData(processedData);
    }
  }, [timeRange, selectedMonth, orders, customers, products, fixedExpenses]);

  const openOrdersPage = (order: Order) => {
    router.push(`/pedidos?highlight=${order.id}`);
  };

  const formatDisplayDate = (dateString: string | null): string => {
    if (!dateString) return "Não definida";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      const adjustedDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
      const day = String(adjustedDate.getUTCDate()).padStart(2, "0");
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, "0");
      const year = adjustedDate.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, customersResponse, productsResponse, expensesResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/customers"),
        api.get("/products"),
        api.get("/fixedExpenses"),
      ]);

      const ordersData = ordersResponse.data;
      const customersData = customersResponse.data;
      const productsData = productsResponse.data;
      const expensesData = expensesResponse.data;

      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setFixedExpenses(expensesData);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para visualizar Relatórios.", { id: "page_error" });
      } else {
        toast.error("Erro ao carregar os dados. Tente novamente.", { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (
    orders: Order[],
    customers: Customer[],
    products: Product[],
    fixedExpenses: FixedExpense[]
  ): AnalyticsData => {
    const filteredOrders = filterOrdersByTimeRange(orders, timeRange, selectedMonth);
    const deliveredOrders = filteredOrders.filter((order) => order.status === "DELIVERED");
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    const totalOrders = filteredOrders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const averageOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    // Cliente que mais pediu
    const customerOrderCount: Record<number, { count: number; total: number }> = {};
    filteredOrders.forEach((order) => {
      if (order.customer) {
        const customerId = order.customer.id;
        if (!customerOrderCount[customerId ? customerId : 0]) {
          customerOrderCount[customerId ? customerId : 0] = { count: 0, total: 0 };
        }
        customerOrderCount[customerId ? customerId : 0].count++;
        customerOrderCount[customerId ? customerId : 0].total += order.total || 0;
      }
    });

    const topCustomerEntry = Object.entries(customerOrderCount).reduce(
      (top, [customerId, data]) => {
        if (!top || data.count > top.data.count) {
          const customer = customers.find((c) => c.id === parseInt(customerId));
          return { customer, data };
        }
        return top;
      },
      null as {
        customer: Customer | undefined;
        data: { count: number; total: number };
      } | null
    );

    const topCustomer = topCustomerEntry
      ? {
          name: topCustomerEntry.customer?.name || "N/A",
          orderCount: topCustomerEntry.data.count,
          totalSpent: topCustomerEntry.data.total,
        }
      : { name: "N/A", orderCount: 0, totalSpent: 0 };

    // Produtos mais e menos vendidos
    const productSales: Record<number, { quantity: number; revenue: number }> = {};
    const productSalesArray: { product: string; quantity: number; revenue: number }[] = [];

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        const product = products.find((p) => p.id === item.productId);
        const revenue = item.quantity * (product?.salePrice || 0);
        productSales[item.productId].revenue += revenue;
      });
    });

    Object.entries(productSales).forEach(([productId, data]) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (product) {
        productSalesArray.push({
          product: product.name,
          quantity: data.quantity,
          revenue: data.revenue,
        });
      }
    });

    const productEntries = Object.entries(productSales);
    const topProductEntry = productEntries.reduce((top, [productId, data]) => {
      if (!top || data.quantity > top.data.quantity) {
        const product = products.find((p) => p.id === parseInt(productId));
        return { product, data };
      }
      return top;
    }, null as { product: Product | undefined; data: { quantity: number; revenue: number } } | null);

    const leastSoldProductEntry = productEntries.reduce(
      (least, [productId, data]) => {
        if (!least || data.quantity < least.data.quantity) {
          const product = products.find((p) => p.id === parseInt(productId));
          return { product, data };
        }
        return least;
      },
      null as {
        product: Product | undefined;
        data: { quantity: number; revenue: number };
      } | null
    );

    const topProduct = topProductEntry
      ? {
          name: topProductEntry.product?.name || "N/A",
          quantitySold: topProductEntry.data.quantity,
          revenue: topProductEntry.data.revenue,
        }
      : { name: "N/A", quantitySold: 0, revenue: 0 };

    const leastSoldProduct = leastSoldProductEntry
      ? {
          name: leastSoldProductEntry.product?.name || "N/A",
          quantitySold: leastSoldProductEntry.data.quantity,
          revenue: leastSoldProductEntry.data.revenue,
        }
      : { name: "N/A", quantitySold: 0, revenue: 0 };

    // Pedidos por status
    const ordersByStatus = {
      pending: filteredOrders.filter((order) => order.status === "PENDING").length,
      inProgress: filteredOrders.filter(
        (order) => order.status === "IN_PROGRESS" || order.status === "IN_PRODUCTION"
      ).length,
      delivered: filteredOrders.filter((order) => order.status === "DELIVERED").length,
      cancelled: filteredOrders.filter((order) => order.status === "CANCELLED").length,
    };

    // Pedidos recentes (últimos 5)
    const recentOrders = filteredOrders
      .sort(
        (a, b) =>
          new Date(b.orderDate ? new Date(b.orderDate.toString()).toISOString() : "").getTime() -
          new Date(a.orderDate ? new Date(a.orderDate.toString()).toISOString() : "").getTime()
      )
      .slice(0, 5);

    // Dados para gráficos
    const monthlyRevenue = generateMonthlyRevenue(filteredOrders);
    const monthlyOrders = generateMonthlyOrders(filteredOrders);

    // --- Processamento das despesas fixas ---
    const filteredExpenses = filterExpensesByTimeRange(fixedExpenses, timeRange, selectedMonth);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.value, 0);

    const monthlyExpenses = generateMonthlyExpenses(fixedExpenses); // histórico completo

    // Agrupar por categoria (considerando apenas despesas do período filtrado)
    const expensesByCategory = Object.entries(
      filteredExpenses.reduce((acc, exp) => {
        const cat = exp.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + exp.value;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      topCustomer,
      topProduct,
      leastSoldProduct,
      ordersByStatus,
      recentOrders,
      monthlyRevenue,
      monthlyOrders,
      productSales: productSalesArray.sort((a, b) => b.quantity - a.quantity).slice(0, 10),
      totalExpenses,
      monthlyExpenses,
      expensesByCategory,
    };
  };

  const generateMonthlyRevenue = (orders: Order[]) => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const revenueByMonth: { [key: string]: number } = {};

    orders.forEach((order) => {
      if (order.status === "DELIVERED") {
        const date = new Date(order.orderDate ? new Date(order.orderDate.toString()).toISOString() : "");
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
        revenueByMonth[monthKey] += order.total || 0;
      }
    });

    return Object.entries(revenueByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, revenue]) => ({
        month: months[parseInt(key.split("-")[1])],
        revenue,
      }));
  };

  const generateMonthlyOrders = (orders: Order[]) => {
    const ordersByMonth: { [key: string]: number } = {};
    orders.forEach((order) => {
      const date = new Date(order.orderDate ? new Date(order.orderDate.toString()).toISOString() : "");
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!ordersByMonth[monthKey]) ordersByMonth[monthKey] = 0;
      ordersByMonth[monthKey] += 1;
    });

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return Object.entries(ordersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split("-");
        return { month: `${monthNames[parseInt(month)]}/${year.substring(2)}`, count };
      })
      .slice(-12);
  };

  const filterOrdersByTimeRange = (orders: Order[], range: "week" | "month" | "year", selectedMonth: number | null): Order[] => {
    const now = new Date();
    
    return orders.filter((order) => {
      const orderDateStr = order.orderDate ? new Date(order.orderDate.toString()).toISOString() : "";
      if (!orderDateStr) return false;
      const orderDate = new Date(orderDateStr);

      if (selectedMonth !== null) {
        return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === selectedMonth;
      }

      let startDate = new Date();
      switch (range) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      return orderDate >= startDate;
    });
  };

  // Funções auxiliares para despesas
  const filterExpensesByTimeRange = (expenses: FixedExpense[], range: "week" | "month" | "year", selectedMonth: number | null): FixedExpense[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return expenses.filter(exp => {
      const [datePart] = exp.date.split('T');
      const [year, month] = datePart.split('-').map(Number);
      const expDate = new Date(year, month - 1, 1);

      if (selectedMonth !== null) {
        const filterDate = new Date(currentYear, selectedMonth, 1);
        if (exp.recurring) {
          return expDate <= filterDate;
        } else {
          return year === currentYear && (month - 1) === selectedMonth;
        }
      }

      let startDate = new Date();
      switch (range) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      return new Date(exp.date) >= startDate;
    });
  };

  const generateMonthlyExpenses = (expenses: FixedExpense[]): { month: string; total: number }[] => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const expenseByMonth: Record<string, number> = {};

    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      expenseByMonth[monthKey] = (expenseByMonth[monthKey] || 0) + exp.value;
    });

    return Object.entries(expenseByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, total]) => {
        const [year, monthIndex] = key.split('-');
        return { month: `${months[parseInt(monthIndex)]}/${year.slice(2)}`, total };
      });
  };

  // Configurações dos gráficos
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Receita Mensal" },
    },
  };

  const revenueChartData = {
    labels: analyticsData?.monthlyRevenue.map((item) => item.month) || [],
    datasets: [
      {
        label: "Receita (R$)",
        data: analyticsData?.monthlyRevenue.map((item) => item.revenue) || [],
        borderColor: "rgb(44, 85, 48)",
        backgroundColor: "rgba(44, 85, 48, 0.5)",
      },
    ],
  };

  const ordersChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Pedidos Mensais" },
    },
  };

  const ordersChartData = {
    labels: analyticsData?.monthlyOrders.map((item) => item.month) || [],
    datasets: [
      {
        label: "Número de Pedidos",
        data: analyticsData?.monthlyOrders.map((item) => item.count) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Distribuição de Status dos Pedidos" },
    },
  };

  const statusChartData = {
    labels: ["Entregues", "Cancelados"],
    datasets: [
      {
        label: "Quantidade",
        data: analyticsData
          ? [analyticsData.ordersByStatus.delivered, analyticsData.ordersByStatus.cancelled]
          : [],
        backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(255, 99, 132, 0.5)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const productsChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Top 10 Produtos Mais Vendidos" },
    },
  };

  const productsChartData = {
    labels: analyticsData?.productSales.map((item) => item.product) || [],
    datasets: [
      {
        label: "Quantidade Vendida",
        data: analyticsData?.productSales.map((item) => item.quantity) || [],
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  };

  // Gráficos de despesas
  const expensesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Despesas Mensais" },
    },
  };

  const expensesChartData = {
    labels: analyticsData?.monthlyExpenses.map((item) => item.month) || [],
    datasets: [
      {
        label: "Despesas (R$)",
        data: analyticsData?.monthlyExpenses.map((item) => item.total) || [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
      title: { display: true, text: "Despesas por Categoria" },
    },
  };

  const categoryChartData = {
    labels: analyticsData?.expensesByCategory.map((item) => item.category) || [],
    datasets: [
      {
        data: analyticsData?.expensesByCategory.map((item) => item.total) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#E7E9ED', '#76A346', '#E7A1B0', '#F1C40F',
        ],
      },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const exportToCSV = () => {
    if (!analyticsData) return;

    const escapeCSV = (val: any): string => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows: string[][] = [];

    // Section 1: Summary Metrics
    rows.push(["=== RESUMO GERAL ==="]);
    rows.push(["Métrica", "Valor"]);
    rows.push(["Receita Total", formatCurrency(analyticsData.totalRevenue)]);
    rows.push(["Total de Pedidos", String(analyticsData.totalOrders)]);
    rows.push(["Total de Clientes", String(analyticsData.totalCustomers)]);
    rows.push(["Total de Produtos", String(analyticsData.totalProducts)]);
    rows.push(["Valor Médio por Pedido", formatCurrency(analyticsData.averageOrderValue)]);
    rows.push(["Despesas no Período", formatCurrency(analyticsData.totalExpenses)]);
    rows.push(["Lucro Estimado", formatCurrency(analyticsData.totalRevenue - analyticsData.totalExpenses)]);
    rows.push([]);

    // Section 2: Top Customer & Products
    rows.push(["=== DESTAQUES ==="]);
    rows.push(["Cliente Mais Frequente", analyticsData.topCustomer.name]);
    rows.push(["Pedidos do Cliente Top", String(analyticsData.topCustomer.orderCount)]);
    rows.push(["Total Gasto pelo Cliente Top", formatCurrency(analyticsData.topCustomer.totalSpent)]);
    rows.push(["Produto Mais Vendido", analyticsData.topProduct.name]);
    rows.push(["Qtd Vendida (Top)", String(analyticsData.topProduct.quantitySold)]);
    rows.push(["Produto Menos Vendido", analyticsData.leastSoldProduct.name]);
    rows.push(["Qtd Vendida (Menor)", String(analyticsData.leastSoldProduct.quantitySold)]);
    rows.push([]);

    // Section 3: Monthly Revenue
    if (analyticsData.monthlyRevenue.length > 0) {
      rows.push(["=== RECEITA MENSAL ==="]);
      rows.push(["Mês", "Receita"]);
      analyticsData.monthlyRevenue.forEach((item) => {
        rows.push([item.month, formatCurrency(item.revenue)]);
      });
      rows.push([]);
    }

    // Section 4: Product Sales
    if (analyticsData.productSales.length > 0) {
      rows.push(["=== VENDAS POR PRODUTO ==="]);
      rows.push(["Produto", "Quantidade", "Receita"]);
      analyticsData.productSales.forEach((item) => {
        rows.push([item.product, String(item.quantity), formatCurrency(item.revenue)]);
      });
      rows.push([]);
    }

    // Section 5: Expenses by Category
    if (analyticsData.expensesByCategory.length > 0) {
      rows.push(["=== DESPESAS POR CATEGORIA ==="]);
      rows.push(["Categoria", "Total"]);
      analyticsData.expensesByCategory.forEach((item) => {
        rows.push([item.category, formatCurrency(item.total)]);
      });
      rows.push([]);
    }

    // Section 6: Order Status
    rows.push(["=== STATUS DOS PEDIDOS ==="]);
    rows.push(["Status", "Quantidade"]);
    rows.push(["Pendentes", String(analyticsData.ordersByStatus.pending)]);
    rows.push(["Em Produção", String(analyticsData.ordersByStatus.inProgress)]);
    rows.push(["Entregues", String(analyticsData.ordersByStatus.delivered)]);
    rows.push(["Cancelados", String(analyticsData.ordersByStatus.cancelled)]);

    const csvContent = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
    // UTF-8 BOM for proper encoding in Excel
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-santsapore-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={styles.errorContainer}>
        <p>Erro ao carregar dados. Tente novamente.</p>
        <button onClick={fetchData} className={styles.retryButton}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.headerActions}>
          <div className={styles.filterSection}>
            <div className={styles.timeFilter}>
              <button
                className={`${styles.timeButton} ${timeRange === "week" && selectedMonth === null ? styles.active : ""}`}
                onClick={() => { setTimeRange("week"); setSelectedMonth(null); }}
              >Semana</button>
              <button
                className={`${styles.timeButton} ${timeRange === "month" && selectedMonth === null ? styles.active : ""}`}
                onClick={() => { setTimeRange("month"); setSelectedMonth(null); }}
              >Mês Atual</button>
              <button
                className={`${styles.timeButton} ${timeRange === "year" && selectedMonth === null ? styles.active : ""}`}
                onClick={() => { setTimeRange("year"); setSelectedMonth(null); }}
              >Ano Atual</button>
            </div>
            
            <div className={styles.monthSelector}>
              {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => (
                <button 
                  key={i} 
                  className={`${styles.monthBtn} ${selectedMonth === i ? styles.monthBtnActive : ''}`}
                  onClick={() => setSelectedMonth(i)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button onClick={exportToCSV} className={styles.exportButton}>
            <ExportIcon size={20} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <CurrencyDollarIcon size={24} className={styles.metricIcon} />
            <span className={styles.metricTitle}>Receita Total</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(analyticsData.totalRevenue)}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <ShoppingCartIcon size={24} className={styles.metricIcon} />
            <span className={styles.metricTitle}>Total de Pedidos</span>
          </div>
          <div className={styles.metricValue}>{analyticsData.totalOrders}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <UsersIcon size={24} className={styles.metricIcon} />
            <span className={styles.metricTitle}>Clientes</span>
          </div>
          <div className={styles.metricValue}>{analyticsData.totalCustomers}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <PackageIcon size={24} className={styles.metricIcon} />
            <span className={styles.metricTitle}>Produtos</span>
          </div>
          <div className={styles.metricValue}>{analyticsData.totalProducts}</div>
        </div>
        {/* NOVO: Card de Despesas */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <CurrencyDollarIcon size={24} className={styles.metricIcon} />
            <span className={styles.metricTitle}>Despesas no Período</span>
          </div>
          <div className={styles.metricValue}>{formatCurrency(analyticsData.totalExpenses)}</div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Receita Mensal */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Receita Mensal</h3></div>
          <div className={styles.chartContainer}>
            <Line options={revenueChartOptions} data={revenueChartData} />
          </div>
        </div>
        {/* Status dos Pedidos */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Status dos Pedidos</h3></div>
          <div className={styles.chartContainer}>
            <Doughnut options={statusChartOptions} data={statusChartData} />
          </div>
        </div>
        {/* Pedidos Mensais */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Pedidos Mensais</h3></div>
          <div className={styles.chartContainer}>
            <Bar options={ordersChartOptions} data={ordersChartData} />
          </div>
        </div>
        {/* Produtos Mais Vendidos */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Produtos Mais Vendidos</h3></div>
          <div className={styles.chartContainer}>
            <Bar options={productsChartOptions} data={productsChartData} />
          </div>
        </div>
        {/* NOVO: Despesas Mensais */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Despesas Mensais</h3></div>
          <div className={styles.chartContainer}>
            <Line options={expensesChartOptions} data={expensesChartData} />
          </div>
        </div>
        {/* NOVO: Despesas por Categoria */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Despesas por Categoria</h3></div>
          <div className={styles.chartContainer}>
            <Pie options={categoryChartOptions} data={categoryChartData} />
          </div>
        </div>
      </div>

      {/* Análises Detalhadas */}
      <div className={styles.analyticsGrid}>
        {/* Cliente Top */}
        <div className={styles.analysisCard}>
          <h3 className={styles.analysisTitle}>
            <StarIcon size={20} fill="#abb500" weight="fill" />
            Cliente Mais Frequente
          </h3>
          <div className={styles.analysisContent}>
            <div className={styles.customerInfo}>
              <div className={styles.customerName}>{analyticsData.topCustomer.name}</div>
              <div className={styles.customerStats}>
                <div className={styles.statItem}><span>Pedidos:</span> <strong>{analyticsData.topCustomer.orderCount}</strong></div>
                <div className={styles.statItem}><span>Total Gasto:</span> <strong>{formatCurrency(analyticsData.topCustomer.totalSpent)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Produto Mais Vendido */}
        <div className={styles.analysisCard}>
          <h3 className={styles.analysisTitle}>
            <TrendUpIcon size={20} />
            Produto Mais Vendido
          </h3>
          <div className={styles.analysisContent}>
            <div className={styles.productInfo}>
              <div className={styles.productName}>{analyticsData.topProduct.name}</div>
              <div className={styles.productStats}>
                <div className={styles.statItem}><span>Quantidade:</span> <strong>{analyticsData.topProduct.quantitySold} unidades</strong></div>
                <div className={styles.statItem}><span>Receita:</span> <strong>{formatCurrency(analyticsData.topProduct.revenue)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Produto Menos Vendido */}
        <div className={styles.analysisCard}>
          <h3 className={styles.analysisTitle}>
            <TrendDownIcon size={20} />
            Produto Menos Vendido
          </h3>
          <div className={styles.analysisContent}>
            <div className={styles.productInfo}>
              <div className={styles.productName}>{analyticsData.leastSoldProduct.name}</div>
              <div className={styles.productStats}>
                <div className={styles.statItem}><span>Quantidade:</span> <strong>{analyticsData.leastSoldProduct.quantitySold} unidades</strong></div>
                <div className={styles.statItem}><span>Receita:</span> <strong>{formatCurrency(analyticsData.leastSoldProduct.revenue)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className={`${styles.analysisCard} ${styles.fullWidth}`}>
          <h3 className={styles.analysisTitle}>
            <ShoppingCartIcon size={20} />
            Visão Geral dos Pedidos
          </h3>
          <div className={styles.analysisContent}>
            <div className={styles.ordersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableRow}>
                  <div className={styles.tableCell}>Pedido</div>
                  <div className={styles.tableCell}>Cliente</div>
                  <div className={styles.tableCell}>Data</div>
                  <div className={styles.tableCell}>Itens</div>
                  <div className={styles.tableCell}>Total</div>
                  <div className={styles.tableCell}>Status</div>
                  <div className={styles.tableCell}>Ações</div>
                </div>
              </div>
              <div className={styles.tableBody}>
                {analyticsData.recentOrders.map((order) => (
                  <div key={order.id} className={styles.tableRow} onClick={() => openOrdersPage(order)}>
                    <div className={styles.tableCell} data-label="Pedido"><strong>#{order.id}</strong></div>
                    <div className={styles.tableCell} data-label="Cliente"><div className={styles.customerCell}>{order.customer?.name || "Cliente"}</div></div>
                    <div className={styles.tableCell} data-label="Data">{order.orderDate ? formatDisplayDate(order.orderDate.toString()) : null}</div>
                    <div className={styles.tableCell} data-label="Itens">{order.items?.length || 0}</div>
                    <div className={styles.tableCell} data-label="Total"><strong>{formatCurrency(order.total || 0)}</strong></div>
                    <div className={styles.tableCell} data-label="Status">
                      <span className={`${styles.statusPill} ${styles[order.status.toLowerCase()]}`}>
                        {order.status === "DELIVERED" ? "Entregue" : order.status === "CANCELLED" ? "Cancelado" : "Em Andamento"}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <button className={styles.actionButton} onClick={(e) => { e.stopPropagation(); openOrdersPage(order); }}>Ver Detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}