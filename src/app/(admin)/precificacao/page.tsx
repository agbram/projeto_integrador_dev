"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Card, { FormData } from "@/components/Cards/Card";
import Modal from "react-bootstrap/Modal";
import api from "@/services/api";
import {
  CalculatorIcon,
  ScalesIcon,
  ShoppingCartSimpleIcon,
  XIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashSimpleIcon,
  ArrowLeftIcon,
  GearIcon,
  FloppyDiskIcon,
} from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import { PageActions } from "@/contexts/PageActions";

// Tipos (mantidos)
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  unitCost: number;
  category?: string;
  supplier?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductIngredient {
  id: number;
  ingredientId: number;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  totalCost: number;
  notes?: string;
}

interface ProductForPricing {
  id: number;
  name: string;
  description?: string;
  category: string;
  fotoUrl?: string;
  priceStatus: string;
  weight?: number;
  yield?: number;
  costPrice?: number;
  salePrice?: number;
  markupPercent?: number;
  profitPercent?: number;
  expensePercent?: number;
  taxPercent?: number;
  minProfit?: number;
  ingredients: ProductIngredient[];
  updatedAt: Date;
}

interface CalculationResult {
  ingredientCost: number;
  costPerUnit: number;
  salePrice: number;
  profit: number;
  profitMargin: number;
  markup: number;
  breakdown?: {
    ingredients: number;
    expenses: number;
    taxes: number;
    profit: number;
  };
}

interface PricingData {
  markupPercent?: number | null;
  profitPercent?: number | null;
  expensePercent?: number;
  taxPercent?: number;
  minProfit?: number;
}

export default function PrecificacaoModal() {
  const [modalShow, setModalShow] = useState(false);
  const [modalIngredientShow, setModalIngredientShow] = useState(false);
  const [modalEditIngredientShow, setModalEditIngredientShow] = useState(false);
  const [modalEditProductIngredientShow, setModalEditProductIngredientShow] = useState(false);
  const [successModalShow, setSuccessModalShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warningModalShow, setWarningModalShow] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [produtosParaCalcular, setProdutosParaCalcular] = useState<ProductForPricing[]>([]);
  const [produtosCalculados, setProdutosCalculados] = useState<ProductForPricing[]>([]);
  const [selectProduto, setSelectProduto] = useState<ProductForPricing | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"para-calcular" | "calculados" | "insumos">("para-calcular");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchIngredient, setSearchIngredient] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editingProductIngredient, setEditingProductIngredient] = useState<ProductIngredient | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "g",
    unitCost: "",
    category: "",
    supplier: "",
  });
  const [ingredientForm, setIngredientForm] = useState({
    quantity: "",
    unit: "g",
    notes: "",
  });
  const [editProductIngredientForm, setEditProductIngredientForm] = useState({
    quantity: "",
    unit: "g",
    notes: "",
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const pageActions = useContext(PageActions);

  const API_URL = "http://localhost:4000";

  const getImageUrl = (fotoUrl: string | undefined | null): string => {
    if (!fotoUrl) {
      return "/placeholder.png";
    }

    console.log("📸 Foto URL do banco (ProdutosModal):", fotoUrl);

    if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) {
      return fotoUrl.replace('localhost:3000', 'localhost:4000').replace(':3000', ':4000');
    }

    const nomeArquivo = fotoUrl.replace(/^\/?imagens\//, '');
    
    return `${API_URL}/imagens/${nomeArquivo}`;
  };

  const safeToFixed = (value: number | undefined | null, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) return "0.00";
    return value.toFixed(decimals);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Busca produtos NÃO calculados
  const fetchProdutosParaCalcular = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/pricing/products/not-calculated");
      setProdutosParaCalcular(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar produtos para calcular:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao carregar produtos");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca produtos JÁ calculados
  const fetchProdutosCalculados = useCallback(async () => {
    try {
      const response = await api.get("/pricing/products/calculated");
      setProdutosCalculados(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar produtos calculados:", error);
    }
  }, []);

  const fetchIngredients = useCallback(async (search = "") => {
    try {
      const params = search ? { search } : {};
      const response = await api.get("/pricing/ingredients", { params });
      setIngredients(response.data.ingredients || response.data);
    } catch (error: any) {
      console.error("Erro ao buscar ingredientes:", error);
    }
  }, []);

  // Função para abrir modal de edição de ingrediente
  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient({...ingredient});
    setModalEditIngredientShow(true);
  };

  // Função para salvar edição do ingrediente
  const handleSaveIngredient = async () => {
    if (!editingIngredient) return;

    if (!editingIngredient.name || !editingIngredient.unitCost) {
      setWarningMessage("Preencha o nome e o custo do ingrediente");
      setWarningModalShow(true);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/pricing/ingredients/${editingIngredient.id}`, {
        name: editingIngredient.name,
        unit: editingIngredient.unit,
        unitCost: editingIngredient.unitCost,
        category: editingIngredient.category,
        supplier: editingIngredient.supplier,
      });

      setSuccessMessage("Ingrediente atualizado com sucesso!");
      setSuccessModalShow(true);
      setModalEditIngredientShow(false);
      setEditingIngredient(null);
      
      // Atualizar lista de ingredientes
      await fetchIngredients();
      
      // Se estiver no modal de produto, recarregar os detalhes para atualizar os custos
      if (selectProduto) {
        await loadProdutoDetalhes(selectProduto.id);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar ingrediente:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao atualizar ingrediente");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de edição de ingrediente do produto
  const handleEditProductIngredient = (item: ProductIngredient) => {
    setEditingProductIngredient(item);
    setEditProductIngredientForm({
      quantity: item.quantity.toString(),
      unit: item.unit,
      notes: item.notes || "",
    });
    setModalEditProductIngredientShow(true);
  };

  // Função para salvar edição do ingrediente do produto
  const handleSaveProductIngredient = async () => {
    if (!editingProductIngredient || !selectProduto) return;

    if (!editProductIngredientForm.quantity) {
      setWarningMessage("Informe a quantidade do ingrediente");
      setWarningModalShow(true);
      return;
    }

    setLoading(true);
    try {
      // productIngredientId = ID da tabela ProductIngredient, não do Ingredient
      await api.put(`/pricing/products/${selectProduto.id}/product-ingredients/${editingProductIngredient.id}`, {
      quantity: parseFloat(editProductIngredientForm.quantity),
      unit: editProductIngredientForm.unit,
      notes: editProductIngredientForm.notes,
    });

      setSuccessMessage("Ingrediente atualizado com sucesso!");
      setSuccessModalShow(true);
      setModalEditProductIngredientShow(false);
      setEditingProductIngredient(null);
      
      // Recarregar os detalhes do produto para atualizar os custos
      await loadProdutoDetalhes(selectProduto.id);
      
    } catch (error: any) {
      console.error("Erro ao atualizar ingrediente do produto:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao atualizar ingrediente");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIngredient = async (ingredientId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este ingrediente? Esta ação não pode ser desfeita.")) return;

    setLoading(true);
    try {
      console.log("🗑️ Tentando excluir ingrediente ID:", ingredientId);
      
      const response = await api.delete(`/pricing/ingredients/${ingredientId}`);
      console.log("✅ Sucesso:", response.data);
      
      setSuccessMessage("Ingrediente excluído com sucesso!");
      setSuccessModalShow(true);
      
      await fetchIngredients();
      
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("Status:", error.response?.status);
      console.error("Dados:", error.response?.data);
      
      let errorMessage = "Erro ao excluir ingrediente";
      let errorDetails = "";
      
      if (error.response?.status === 400) {
        const data = error.response.data;
        
        if (data.products && Array.isArray(data.products)) {
          // O backend retornou produtos específicos
          errorMessage = "Ingrediente em uso!";
          errorDetails = `Este ingrediente está sendo usado em ${data.products.length} produto(s).\n\n`;
          
          data.products.forEach((p: any, index: number) => {
            errorDetails += `${index + 1}. ${p.productName} (ID: ${p.productId})\n`;
          });
          
          errorDetails += "\nRemova o ingrediente dos produtos antes de excluí-lo.";
        } else if (data.error) {
          errorMessage = data.error;
          errorDetails = data.message || "";
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Ingrediente não encontrado";
        errorDetails = "O ingrediente que você tentou excluir não existe mais.";
      }
      
      setWarningMessage(`${errorMessage}\n\n${errorDetails}`);
      setWarningModalShow(true);
      
    } finally {
      setLoading(false);
    }
  };

  const loadProdutoDetalhes = async (productId: number) => {
    console.log("🔍 Carregando detalhes do produto ID:", productId);
    
    setLoading(true);
    try {
      const response = await api.get(`/pricing/products/${productId}`);
      console.log("✅ Dados recebidos:", response.data);
      
      setSelectProduto(response.data);
      setModalShow(true);
      
      console.log("✅ Produto selecionado definido:", response.data.id, response.data.name);
    } catch (error: any) {
      console.error("❌ Erro ao carregar produto:", error);
      console.error("Status:", error.response?.status);
      console.error("Dados:", error.response?.data);
      
      setWarningMessage(error.response?.data?.error || "Erro ao carregar produto");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Adiciona ingrediente ao produto
  const handleAddIngredient = async () => {
    if (!selectedIngredient || !ingredientForm.quantity) {
      setWarningMessage("Selecione um ingrediente e informe a quantidade");
      setWarningModalShow(true);
      return;
    }

    if (!selectProduto) return;

    setLoading(true);
    try {
      await api.post(`/pricing/products/${selectProduto.id}/ingredients`, {
        ingredientId: selectedIngredient.id,
        quantity: parseFloat(ingredientForm.quantity),
        unit: ingredientForm.unit,
        notes: ingredientForm.notes,
      });

      await loadProdutoDetalhes(selectProduto.id);
      setSelectedIngredient(null);
      setIngredientForm({ quantity: "", unit: "g", notes: "" });
      setSearchIngredient("");
      setModalIngredientShow(false);

      setSuccessMessage("Ingrediente adicionado com sucesso!");
      setSuccessModalShow(true);
    } catch (error: any) {
      console.error("Erro ao adicionar ingrediente:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao adicionar ingrediente");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Remove ingrediente do produto
  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!selectProduto) return;

    if (!window.confirm("Remover este ingrediente?")) return;

    try {
      await api.delete(`/pricing/products/${selectProduto.id}/ingredients/${ingredientId}`);
      await loadProdutoDetalhes(selectProduto.id);
      setSuccessMessage("Ingrediente removido com sucesso!");
      setSuccessModalShow(true);
    } catch (error: any) {
      console.error("Erro ao remover ingrediente:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao remover ingrediente");
      setWarningModalShow(true);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchIngredient(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchIngredients(value);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [fetchIngredients, searchTimeout]);

  const handleSimulatePrice = async (data: FormData) => {
    console.log("🎯 Iniciando simulação...");
    
    if (!selectProduto || !selectProduto.id) {
      setWarningMessage("Erro: Produto não selecionado.");
      setWarningModalShow(true);
      return;
    }

    setLoading(true);
    try {
      setCalculationResult(null);
      
      const strategy = data.strategy as string;
      
      let formData: any = {
        expensePercent: data.expensePercent ? parseFloat(data.expensePercent as string) : 0,
        taxPercent: data.taxPercent ? parseFloat(data.taxPercent as string) : 0,
        minProfit: data.minProfit ? parseFloat(data.minProfit as string) : 0,
      };

      if (strategy === "markup" && data.markupPercent) {
        formData.markupPercent = parseFloat(data.markupPercent as string);
      } else if (strategy === "margin" && data.profitPercent) {
        formData.profitPercent = parseFloat(data.profitPercent as string);
      } else {
        throw new Error("Preencha os campos corretamente");
      }

      console.log("📤 Enviando simulação:", formData);
      const response = await api.post(`/pricing/products/${selectProduto.id}/simulate`, formData);
      
      console.log("✅ Resposta:", response.data);
      
      setCalculationResult(response.data);
      setCurrentSlide(1);
          
    } catch (error: any) {
      console.error("❌ Erro na simulação:", error);
      
      let errorMessage = "Erro na simulação";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setWarningMessage(errorMessage);
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const renderProdutosParaCalcular = useMemo(() => {
    return produtosParaCalcular.map((produto) => (
      <div key={produto.id} className={styles.productCard}>
        <div className={styles.productCardHeader}>
          {produto.fotoUrl && (
            <img
              src={getImageUrl(produto.fotoUrl)}
              alt={produto.name}
              className={styles.productImage}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          )}
          <h4>{produto.name}</h4>
          <span className={styles.badgeNotCalculated}>
            <i>ainda não calculado</i>
          </span>
        </div>
        <div className={styles.productCardBody}>
          <p className={styles.productCategory}>{produto.category}</p>
          <p className={styles.productDescription}>{produto.description}</p>
          <div className={styles.productInfo}>
            {produto.weight && <span>Peso: {produto.weight}kg</span>}
            {produto.yield && <span>Rendimento: {produto.yield} un</span>}
          </div>
        </div>
        <div className={styles.productCardFooter}>
          <button
            className={styles.btnPrecificar}
            onClick={() => loadProdutoDetalhes(produto.id)}
            disabled={loading}
          >
            <CalculatorIcon size={16} />
            Precificar
          </button>
        </div>
      </div>
    ));
  }, [produtosParaCalcular, loading]);

  const renderProdutosCalculados = useMemo(() => {
    return produtosCalculados.map((produto) => (
      <div key={produto.id} className={styles.productCard}>
        <div className={styles.productCardHeader}>
          {produto.fotoUrl && (
            <img
              src={getImageUrl(produto.fotoUrl)}
              alt={produto.name}
              className={styles.productImage}
              loading="lazy"
            />
          )}
          <h4>{produto.name}</h4>
          <span className={styles.badgeCalculated}>✓ calculado</span>
        </div>
        <div className={styles.productCardBody}>
          <p className={styles.productCategory}>{produto.category}</p>
          <div className={styles.priceInfo}>
            <div className={styles.priceItem}>
              <span>Custo:</span>
              <strong>R$ {produto.costPrice?.toFixed(2) || "0,00"}</strong>
            </div>
            <div className={styles.priceItem}>
              <span>Venda:</span>
              <strong className={styles.salePrice}>
                R$ {produto.salePrice?.toFixed(2) || "0,00"}
              </strong>
            </div>
            <div className={styles.priceItem}>
              <span>Markup:</span>
              <strong>{produto.markupPercent?.toFixed(1) || "0"}%</strong>
            </div>
          </div>
          {produto.updatedAt && (
            <div className={styles.lastUpdated}>
              <small>Atualizado: {new Date(produto.updatedAt).toLocaleDateString()}</small>
            </div>
          )}
        </div>
        <div className={styles.productCardFooter}>
          <button
            className={styles.btnEditar}
            onClick={() => loadProdutoDetalhes(produto.id)}
          >
            <PencilIcon size={16} />
            Editar Preço
          </button>
        </div>
      </div>
    ));
  }, [produtosCalculados]);

  // Renderizar lista de insumos
  const renderIngredientsList = useMemo(() => {
    return ingredients.map((ingredient) => (
      <div key={ingredient.id} className={styles.ingredientItemCard}>
        <div className={styles.ingredientItemHeader}>
          <h5>{ingredient.name}</h5>
          <span className={styles.ingredientCategoryBadge}>
            {ingredient.category || "Sem categoria"}
          </span>
        </div>
        <div className={styles.ingredientItemBody}>
          <div className={styles.ingredientInfoRow}>
            <span><strong>Unidade:</strong> {ingredient.unit}</span>
            <span><strong>Custo Unitário:</strong> R$ {ingredient.unitCost.toFixed(2)}</span>
          </div>
          <div className={styles.ingredientInfoRow}>
            <span><strong>Fornecedor:</strong> {ingredient.supplier || "Não informado"}</span>
          </div>
          {ingredient.updatedAt && (
            <div className={styles.ingredientInfoRow}>
              <small>Última atualização: {new Date(ingredient.updatedAt).toLocaleDateString()}</small>
            </div>
          )}
        </div>
        <div className={styles.ingredientItemFooter}>
          <button
            className={styles.btnEditar}
            onClick={() => handleEditIngredient(ingredient)}
            title="Editar ingrediente"
          >
            <PencilIcon size={14} />
            Editar
          </button>
          <button
            className={styles.btnExcluir}
            onClick={() => handleDeleteIngredient(ingredient.id)}
            title="Excluir ingrediente"
          >
            <TrashSimpleIcon size={14} />
            Excluir
          </button>
        </div>
      </div>
    ));
  }, [ingredients]);

  const handleCalculatePrice = async (data: FormData) => {
    if (!selectProduto) return;

    setLoading(true);
    try {
      const pricingData: PricingData = {
        markupPercent: data.markupPercent ? parseFloat(data.markupPercent as string) : null,
        profitPercent: data.profitPercent ? parseFloat(data.profitPercent as string) : null,
        expensePercent: data.expensePercent ? parseFloat(data.expensePercent as string) : 0,
        taxPercent: data.taxPercent ? parseFloat(data.taxPercent as string) : 0,
        minProfit: data.minProfit ? parseFloat(data.minProfit as string) : 0,
      };

      await api.post(`/pricing/products/${selectProduto.id}/calculate`, pricingData);

      setSuccessMessage("Preço calculado e salvo com sucesso!");
      setSuccessModalShow(true);
      setModalShow(false);
      setCalculationResult(null);

      await Promise.all([fetchProdutosParaCalcular(), fetchProdutosCalculados()]);
    } catch (error: any) {
      console.error("Erro ao calcular preço:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao calcular preço");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFromSimulation = async () => {
    if (!selectProduto || !calculationResult) {
      console.error("❌ Não há cálculo para salvar");
      setWarningMessage("Faça uma simulação primeiro");
      setWarningModalShow(true);
      return;
    }

    const confirmSave = window.confirm(
      "Deseja salvar este preço calculado? O produto será movido para 'Já Calculados'."
    );
    
    if (!confirmSave) return;

    setLoading(true);
    try {
      console.log("💾 Salvando cálculo...");
      
      const pricingData = {
        markupPercent: calculationResult.markup,
        profitPercent: calculationResult.profitMargin,
        expensePercent: 20,
        taxPercent: 15,
        minProfit: 0
      };

      console.log("Enviando para cálculo final:", pricingData);

      const response = await api.post(
        `/pricing/products/${selectProduto.id}/calculate`,
        pricingData
      );
      
      console.log("✅ Preço salvo:", response.data);

      const updatedProduct = {
        ...selectProduto,
        priceStatus: "CALCULATED",
        costPrice: calculationResult.costPerUnit,
        salePrice: calculationResult.salePrice,
        markupPercent: calculationResult.markup,
        profitPercent: calculationResult.profitMargin,
        updatedAt: new Date()
      };

      setProdutosParaCalcular(prev => 
        prev.filter(p => p.id !== selectProduto.id)
      );
      
      setProdutosCalculados(prev => {
        const filtered = prev.filter(p => p.id !== selectProduto.id);
        return [updatedProduct, ...filtered];
      });

      setSuccessMessage("✅ Preço salvo com sucesso! O produto agora está em 'Já Calculados'.");
      setSuccessModalShow(true);
      setModalShow(false);
      setCalculationResult(null);
      setSelectProduto(null);

      fetchProdutosParaCalcular();
      fetchProdutosCalculados();

    } catch (error: any) {
      console.error("❌ Erro ao salvar:", error);
      setWarningMessage(
        error.response?.data?.error || "Erro ao salvar. Tente novamente."
      );
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Cria novo ingrediente
  const handleCreateIngredient = async () => {
    if (!newIngredient.name || !newIngredient.unit || !newIngredient.unitCost) {
      setWarningMessage("Preencha nome, unidade e custo do ingrediente");
      setWarningModalShow(true);
      return;
    }

    setLoading(true);
    try {
      await api.post("/pricing/ingredients", {
        name: newIngredient.name,
        unit: newIngredient.unit,
        unitCost: parseFloat(newIngredient.unitCost),
        category: newIngredient.category,
        supplier: newIngredient.supplier,
      });

      await fetchIngredients();
      setNewIngredient({
        name: "",
        unit: "g",
        unitCost: "",
        category: "",
        supplier: "",
      });

      setSuccessMessage("Ingrediente cadastrado na matriz!");
      setSuccessModalShow(true);
    } catch (error: any) {
      console.error("Erro ao criar ingrediente:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao criar ingrediente");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Reseta o preço do produto
  const handleResetPrice = async () => {
    if (!selectProduto) return;

    if (!window.confirm("Resetar o preço deste produto? Ele voltará para a lista de precificação."))
      return;

    setLoading(true);
    try {
      await api.post(`/pricing/products/${selectProduto.id}/reset`);
      setSuccessMessage("Preço resetado! Produto voltou para a lista de precificação.");
      setSuccessModalShow(true);
      setModalShow(false);
      await fetchProdutosParaCalcular();
      await fetchProdutosCalculados();
    } catch (error: any) {
      console.error("Erro ao resetar preço:", error);
      setWarningMessage(error.response?.data?.error || "Erro ao resetar preço");
      setWarningModalShow(true);
    } finally {
      setLoading(false);
    }
  };

  // Calcula custo total dos ingredientes COM VERIFICAÇÃO
  const calculateTotalCost = () => {
    if (!selectProduto) return 0;
    
    return selectProduto.ingredients.reduce((sum, item) => {
      return sum + getCalculatedCost(item);
    }, 0);
  };

  // Calcula custo por unidade
  const calculateCostPerUnit = () => {
    const total = calculateTotalCost();
    if (!selectProduto?.yield || selectProduto.yield <= 0) return total;
    return total / selectProduto.yield;
  };

  useEffect(() => {
    pageActions.setShowAddButton(false);
    
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProdutosParaCalcular(),
          fetchProdutosCalculados(),
          fetchIngredients()
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    return () => {
      pageActions.setShowAddButton(true);
    };
  }, [fetchProdutosParaCalcular, fetchProdutosCalculados, fetchIngredients]);

  // Função para converter unidades no frontend
  const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
    const conversions: Record<string, Record<string, number>> = {
      // Massa
      'kg': { 'g': 1000, 'mg': 1000000, 'kg': 1 },
      'g': { 'kg': 0.001, 'mg': 1000, 'g': 1 },
      'mg': { 'kg': 0.000001, 'g': 0.001, 'mg': 1 },
      
      // Volume
      'L': { 'ml': 1000, 'cl': 100, 'L': 1 },
      'ml': { 'L': 0.001, 'cl': 0.1, 'ml': 1 },
      'cl': { 'L': 0.01, 'ml': 10, 'cl': 1 },
      
      // Unidades
      'un': { 'un': 1 }
    };

    if (fromUnit === toUnit) return value;
    
    if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
      return value * conversions[fromUnit][toUnit];
    }
    
    if (conversions[toUnit] && conversions[toUnit][fromUnit]) {
      return value / conversions[toUnit][fromUnit];
    }
    
    console.warn(`Conversão não suportada: ${fromUnit} para ${toUnit}`);
    return value;
  };

  // Função para calcular e verificar o custo total
  const getCalculatedCost = (item: ProductIngredient) => {
    const { ingredient, quantity, unit } = item;
    
    if (ingredient.unit === unit) {
      return item.totalCost;
    }
    
    try {
      const convertedQuantity = convertUnit(quantity, unit, ingredient.unit);
      const calculatedCost = ingredient.unitCost * convertedQuantity;
      
      const difference = Math.abs(calculatedCost - item.totalCost);
      const tolerance = 0.01;
      
      if (difference > tolerance) {
        console.warn(`Possível erro de cálculo:`, {
          ingrediente: ingredient.name,
          quantidade: `${quantity} ${unit}`,
          custoUnitario: `${ingredient.unitCost}/${ingredient.unit}`,
          custoSalvo: item.totalCost,
          custoCalculado: calculatedCost,
          diferenca: difference
        });
      }
      
      return calculatedCost;
    } catch (error) {
      console.error("Erro ao calcular custo:", error);
      return item.totalCost;
    }
  };

  // Função para formatar o valor com conversão
  const formatQuantityWithConversion = (item: ProductIngredient) => {
    const { quantity, unit, ingredient } = item;
    
    if (ingredient.unit === unit) {
      return `${quantity} ${unit}`;
    }
    
    const convertedQuantity = convertUnit(quantity, unit, ingredient.unit);
    return (
      <div>
        <div>{quantity} {unit}</div>
        <div className={styles.unitConversion}>
          <small>(≈ {convertedQuantity.toFixed(3)} {ingredient.unit})</small>
        </div>
      </div>
    );
  };

  // Função para formatar o custo unitário com conversão
  const formatUnitCostWithConversion = (item: ProductIngredient) => {
    const { ingredient, unit } = item;
    
    if (ingredient.unit === unit) {
      return `R$ ${ingredient.unitCost.toFixed(2)}/${ingredient.unit}`;
    }
    
    const convertedUnitCost = convertUnit(1, ingredient.unit, unit);
    const costPerUsedUnit = ingredient.unitCost * convertedUnitCost;
    
    return (
      <div>
        <div>R$ ${ingredient.unitCost.toFixed(2)}/{ingredient.unit}</div>
        <div className={styles.unitConversion}>
          <small>(R$ {costPerUsedUnit.toFixed(4)}/{unit})</small>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Abas - ADICIONADA ABA "INSUMOS" */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "para-calcular" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("para-calcular")}
          >
            <CalculatorIcon size={20} />
            Para Precificar ({produtosParaCalcular.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "calculados" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("calculados")}
          >
            <ScalesIcon size={20} />
            Já Calculados ({produtosCalculados.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "insumos" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("insumos")}
          >
            <GearIcon size={20} />
            Insumos <br /> ({ingredients.length})
          </button>
        </div>

        {/* Lista de Produtos/Insumos */}
        <div className={styles.productsGrid}>
          {loading ? (
            <div className={styles.emptyState}>
              <h3>Carregando...</h3>
            </div>
          ) : activeTab === "para-calcular" ? (
            produtosParaCalcular.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Nenhum produto aguardando precificação</h3>
                <p>Todos os produtos já tiveram seus preços calculados!</p>
              </div>
            ) : (
              renderProdutosParaCalcular
            )
          ) : activeTab === "calculados" ? (
            produtosCalculados.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Nenhum produto com preço calculado</h3>
                <p>Calcule os preços na aba "Para Precificar"</p>
              </div>
            ) : (
              renderProdutosCalculados
            )
          ) : activeTab === "insumos" ? (
            ingredients.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Nenhum insumo cadastrado</h3>
                <p>Adicione insumos para usar na precificação dos produtos</p>
                <button
                  className={styles.btnAddIngredientSmall}
                  onClick={() => setModalIngredientShow(true)}
                >
                  <PlusIcon size={14} />
                  Cadastrar primeiro insumo
                </button>
              </div>
            ) : (
              <div className={styles.ingredientsListContainer}>
                <div className={styles.ingredientsListHeader}>
                  <h4>Matriz de Insumos</h4>
                  <button
                    className={styles.btnAddIngredient}
                    onClick={() => setModalIngredientShow(true)}
                  >
                    <PlusIcon size={16} />
                    Novo Insumo
                  </button>
                </div>
                <div className={styles.ingredientsGrid}>
                  {renderIngredientsList}
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
      
      {/* Modal de Precificação (mantido igual) */}
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectProduto(null);
          setCalculationResult(null);
          setCurrentSlide(0);
        }}
        size="xl"
        centered
        className={styles.modalPrecificacao}
      >
        <Modal.Header closeButton className={styles.modalPrecificacaoHeader}>
          <Modal.Title className={styles.modalPrecificacaoTitle}>
            {selectProduto?.name}
            {selectProduto?.priceStatus === "CALCULATED" && (
              <span className={styles.badgeCalculatedInline}>Preço Calculado</span>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={styles.modalPrecificacaoBody}>
          {selectProduto && (
            <div className={styles.carouselContainer}>
              <div className={styles.slideCounter}>
                Slide {currentSlide + 1} de 2
              </div>
              
              <div 
                className={styles.carouselTrack}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* SLIDE 1: Produto + Cálculo */}
                <div className={styles.carouselSlide}>
                  <div className={styles.pricingColumns}>
                    {/* Coluna 1: Ingredientes */}
                    <div className={styles.ingredientsColumn}>
                      <div className={styles.sectionHeader}>
                        <ShoppingCartSimpleIcon size={20} />
                        <h5>Matriz de Ingredientes</h5>
                        <button
                          className={styles.btnAddIngredient}
                          onClick={() => setModalIngredientShow(true)}
                        >
                          <PlusIcon size={16} />
                          Adicionar
                        </button>
                      </div>

                      {selectProduto.ingredients.length === 0 ? (
                        <div className={styles.emptyIngredients}>
                          <p>Nenhum ingrediente adicionado</p>
                          <button
                            className={styles.btnAddIngredientSmall}
                            onClick={() => setModalIngredientShow(true)}
                          >
                            <PlusIcon size={14} />
                            Adicionar primeiro ingrediente
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.ingredientsTable}>
                            <table>
                              <thead>
                                <tr>
                                  <th>Ingrediente</th>
                                  <th>Qtd</th>
                                  <th>Custo Unit.</th>
                                  <th>Custo Total</th>
                                  <th>Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectProduto.ingredients.map((item) => {
                                  const calculatedCost = getCalculatedCost(item);
                                  
                                  return (
                                    <tr key={item.id}>
                                      <td>
                                        <div className={styles.ingredientName}>
                                          <strong>{item.ingredient.name}</strong>
                                          <small>{item.ingredient.category}</small>
                                        </div>
                                      </td>
                                      <td>
                                        {formatQuantityWithConversion(item)}
                                      </td>
                                      <td>
                                        {formatUnitCostWithConversion(item)}
                                      </td>
                                      <td>
                                        <strong className={styles.costTotal}>
                                          R$ {calculatedCost.toFixed(2)}
                                        </strong>
                                        {item.ingredient.unit !== item.unit && (
                                          <div className={styles.costBreakdown}>
                                            <small>
                                              {item.quantity}{item.unit} = 
                                              {convertUnit(item.quantity, item.unit, item.ingredient.unit).toFixed(3)}{item.ingredient.unit} × 
                                              R$ {item.ingredient.unitCost}/{item.ingredient.unit}
                                            </small>
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        <div className={styles.ingredientActions}>
                                          <button
                                            className={styles.btnEdit}
                                            onClick={() => handleEditProductIngredient(item)}
                                            title="Editar quantidade/notas"
                                          >
                                            <PencilIcon size={14} />
                                          </button>
                                          <button
                                            className={styles.btnRemove}
                                            onClick={() => handleRemoveIngredient(item.ingredientId)}
                                            title="Remover"
                                          >
                                            <TrashSimpleIcon size={14} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Resumo dos custos */}
                          <div className={styles.costSummary}>
                            <div className={styles.costItem}>
                              <span>Custo Total Ingredientes:</span>
                              <strong>R$ {calculateTotalCost().toFixed(2)}</strong>
                            </div>
                            {selectProduto.yield && selectProduto.yield > 0 && (
                              <>
                                <div className={styles.costItem}>
                                  <span>Rendimento:</span>
                                  <strong>{selectProduto.yield} unidades</strong>
                                </div>
                                <div className={styles.costItem}>
                                  <span>Custo por Unidade:</span>
                                  <strong className={styles.costPerUnit}>
                                    R$ {calculateCostPerUnit().toFixed(2)}
                                  </strong>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Coluna 2: Cálculos */}
                    <div className={styles.calculationColumn}>
                      <div className={styles.sectionHeader}>
                        <CalculatorIcon size={20} />
                        <h5>Cálculo do Preço</h5>
                      </div>

                      <Card
                        title=""
                        fields={[
                          {
                            name: "strategy",
                            label: "Estratégia",
                            type: "select",
                            options: [
                              { value: "markup", label: "Markup sobre custo" },
                              { value: "margin", label: "Margem de lucro" },
                            ],
                          },
                          {
                            name: "markupPercent",
                            label: "Markup (%)",
                            type: "number",
                            placeholder: "Ex: 50 para 50%",
                            condition: (data: any) => data.strategy === "markup",
                            step: "0.1",
                          },
                          {
                            name: "profitPercent",
                            label: "Margem de Lucro (%)",
                            type: "number",
                            placeholder: "Ex: 30 para 30%",
                            condition: (data: any) => data.strategy === "margin",
                            step: "0.1",
                          },
                          {
                            name: "expensePercent",
                            label: "Despesas Operacionais (%)",
                            type: "number",
                            step: "0.1",
                          },
                          {
                            name: "taxPercent",
                            label: "Impostos (%)",
                            type: "number",
                            step: "0.1",
                          },
                          {
                            name: "minProfit",
                            label: "Lucro Mínimo (R$)",
                            type: "number",
                            placeholder: "Ex: 5.00",
                            step: "0.01",
                          },
                        ]}
                        onSubmit={handleSimulatePrice}
                        submitLabel="Simular Preço"
                        loading={loading}
                        showCancel={false}
                      />

                      {selectProduto?.priceStatus === "CALCULATED" && (
                        <div className={styles.calculatedActions}>
                          <button
                            className={styles.btnReset}
                            onClick={handleResetPrice}
                            disabled={loading}
                          >
                            <XIcon size={16} />
                            Resetar Preço
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* SLIDE 2: Resultado da Simulação */}
                <div className={styles.carouselSlide}>
                  {calculationResult ? (
                    <div className={styles.resultColumn}>
                      <div className={styles.resultHeader}>
                        <ScalesIcon size={24} weight="fill" />
                        <h5>Resultado da Simulação</h5>
                        <span className={styles.simulationBadge}>
                          <CalculatorIcon size={12} />
                          Simulado
                        </span>
                      </div>
                      
                      <div className={styles.resultGrid}>
                        <div className={styles.resultItem}>
                          <span>Custo dos Ingredientes:</span>
                          <strong>R$ {calculationResult.ingredientCost.toFixed(2)}</strong>
                        </div>
                        <div className={styles.resultItem}>
                          <span>Custo por Unidade:</span>
                          <strong>R$ {calculationResult.costPerUnit.toFixed(2)}</strong>
                        </div>
                        <div className={styles.resultItem}>
                          <span>Preço de Venda Sugerido:</span>
                          <strong className={styles.salePriceResult}>
                            R$ {calculationResult.salePrice.toFixed(2)}
                          </strong>
                        </div>
                        <div className={styles.resultItem}>
                          <span>Lucro Unitário:</span>
                          <strong>R$ {calculationResult.profit.toFixed(2)}</strong>
                        </div>
                        <div className={styles.resultItem}>
                          <span>Margem de Lucro:</span>
                          <strong>{calculationResult.profitMargin.toFixed(1)}%</strong>
                        </div>
                        <div className={styles.resultItem}>
                          <span>Markup Aplicado:</span>
                          <strong>{calculationResult.markup.toFixed(1)}%</strong>
                        </div>
                      </div>

                      {calculationResult.breakdown && (
                        <div className={styles.costBreakdownSection}>
                          <h6>Detalhamento dos Custos:</h6>
                          <div className={styles.breakdownItem}>
                            <span>Ingredientes:</span>
                            <span>R$ {calculationResult.breakdown.ingredients?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className={styles.breakdownItem}>
                            <span>Despesas:</span>
                            <span>R$ {calculationResult.breakdown.expenses?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className={styles.breakdownItem}>
                            <span>Impostos:</span>
                            <span>R$ {calculationResult.breakdown.taxes?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      )}

                      {/* AÇÕES DO RESULTADO */}
                      <div className={styles.resultActions}>
                        <button
                          className={styles.btnSaveCalculation}
                          onClick={handleCalculateFromSimulation}
                          disabled={loading}
                        >
                          <ScalesIcon size={18} weight="fill" />
                          {selectProduto?.priceStatus === "CALCULATED" ? "Atualizar Preço" : "Salvar Preço Calculado"}
                        </button>
                        
                        <button
                          className={styles.btnNewSimulation}
                          onClick={() => {
                            setCalculationResult(null);
                            setCurrentSlide(0);
                          }}
                        >
                          <CalculatorIcon size={16} />
                          Nova Simulação
                        </button>
                        
                        <div className={styles.note}>
                          <small>
                            <i>
                              {selectProduto?.priceStatus === "CALCULATED" 
                                ? "Ao salvar, o preço atual será substituído por este valor."
                                : "Ao salvar, o produto será movido para 'Já Calculados'."}
                            </i>
                          </small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <h3>Faça uma simulação primeiro</h3>
                      <p>Volte para o slide anterior e clique em "Simular Preço"</p>
                      <button
                        className={styles.btnNewSimulation}
                        onClick={() => setCurrentSlide(0)}
                      >
                        <ArrowLeftIcon size={16} />
                        Voltar para Cálculo
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Controles do carrossel */}
              <div className={styles.carouselControls}>
                <button
                  className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                  onClick={() => setCurrentSlide(0)}
                  disabled={currentSlide === 0}
                >
                  ←
                </button>
                
                <div className={styles.carouselIndicators}>
                  <button
                    className={`${styles.carouselIndicator} ${currentSlide === 0 ? styles.active : ''}`}
                    onClick={() => setCurrentSlide(0)}
                  />
                  <button
                    className={`${styles.carouselIndicator} ${currentSlide === 1 ? styles.active : ''}`}
                    onClick={() => setCurrentSlide(1)}
                    disabled={!calculationResult}
                  />
                </div>
                
                <button
                  className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                  onClick={() => setCurrentSlide(1)}
                  disabled={currentSlide === 1 || !calculationResult}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal para Adicionar Ingrediente (mantido igual) */}
      <Modal
        show={modalIngredientShow}
        onHide={() => setModalIngredientShow(false)}
        size="lg"
        centered
        className={styles.modalIngredient}
      >
        <Modal.Header closeButton className={styles.modalIngredientHeader}>
          <Modal.Title className={styles.modalIngredientTitle}>
            Adicionar Ingrediente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalIngredientBody}>
          <div className={styles.ingredientContainer}>
            {/* Busca de ingredientes existentes */}
            <div className={styles.searchSection}>
              <div className={styles.searchBox}>
                <MagnifyingGlassIcon size={20} />
                <input
                  type="text"
                  placeholder="Buscar ingrediente na matriz..."
                  value={searchIngredient}
                  onChange={(e) => {
                    setSearchIngredient(e.target.value);
                    fetchIngredients(e.target.value);
                  }}
                  className={styles.searchInput}
                />
              </div>

              {searchIngredient && (
                <div className={styles.searchResults}>
                  {ingredients.length === 0 ? (
                    <p className={styles.noResults}>Nenhum ingrediente encontrado</p>
                  ) : (
                    ingredients.map((ing) => (
                      <div
                        key={ing.id}
                        className={`${styles.ingredientOption} ${
                          selectedIngredient?.id === ing.id ? styles.selected : ""
                        }`}
                        onClick={() => setSelectedIngredient(ing)}
                      >
                        <div>
                          <strong>{ing.name}</strong>
                          <small>
                            {ing.category} • {ing.supplier || "Sem fornecedor"}
                          </small>
                        </div>
                        <div className={styles.ingredientPrice}>
                          R$ {ing.unitCost.toFixed(2)}/{ing.unit}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedIngredient && (
                <div className={styles.selectedIngredient}>
                  <h6>Ingrediente Selecionado:</h6>
                  <div className={styles.ingredientInfo}>
                    <strong>{selectedIngredient.name}</strong>
                    <span>
                      R$ {selectedIngredient.unitCost.toFixed(2)}/
                      {selectedIngredient.unit}
                    </span>
                  </div>

                  <div className={styles.ingredientForm}>
                    <div className={styles.formGroup}>
                      <label>Quantidade:</label>
                      <input
                        type="number"
                        step="0.001"
                        value={ingredientForm.quantity}
                        onChange={(e) =>
                          setIngredientForm({
                            ...ingredientForm,
                            quantity: e.target.value,
                          })
                        }
                        placeholder="Ex: 500"
                      />
                      <select
                        value={ingredientForm.unit}
                        onChange={(e) =>
                          setIngredientForm({
                            ...ingredientForm,
                            unit: e.target.value,
                          })
                        }
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                        <option value="un">un</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Notas (opcional):</label>
                      <input
                        type="text"
                        value={ingredientForm.notes}
                        onChange={(e) =>
                          setIngredientForm({
                            ...ingredientForm,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Ex: Farinha especial"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separador OU */}
            <div className={styles.orSeparator}>
              <span>OU</span>
            </div>

            {/* Cadastrar novo ingrediente */}
            <div className={styles.newIngredientSection}>
              <h6>Cadastrar Novo Ingrediente na Matriz</h6>
              <div className={styles.newIngredientForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          name: e.target.value,
                        })
                      }
                      placeholder="Ex: Farinha de Trigo"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Unidade *</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          unit: e.target.value,
                        })
                      }
                    >
                      <option value="g">Gramas (g)</option>
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="L">Litros (L)</option>
                      <option value="un">Unidades (un)</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Custo Unitário *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newIngredient.unitCost}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          unitCost: e.target.value,
                        })
                      }
                      placeholder="Ex: 4.50"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Categoria</label>
                    <input
                      type="text"
                      value={newIngredient.category}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          category: e.target.value,
                        })
                      }
                      placeholder="Ex: Secos"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Fornecedor</label>
                  <input
                    type="text"
                    value={newIngredient.supplier}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        supplier: e.target.value,
                      })
                    }
                    placeholder="Ex: Fornecedor A"
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.modalIngredientFooter}>
          <ButtonCancelar
            variant="outline"
            onClick={() => setModalIngredientShow(false)}
            CancelLabel="Cancelar"
          />
          <button
            className={styles.btnAddIngredientSubmit}
            onClick={selectedIngredient ? handleAddIngredient : handleCreateIngredient}
            disabled={loading}
          >
            {selectedIngredient ? "Adicionar ao Produto" : "Cadastrar na Matriz"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Ingrediente da Matriz (NOVO) */}
      <Modal
        show={modalEditIngredientShow}
        onHide={() => {
          setModalEditIngredientShow(false);
          setEditingIngredient(null);
        }}
        size="xl"
        centered
        className={styles.modalEditIngredient}
      >
        <Modal.Header closeButton className={styles.modalEditIngredientHeader}>
          <Modal.Title className={styles.modalEditIngredientTitle}>
            <PencilIcon size={20} />
            Editar Insumo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalEditIngredientBody}>
          {editingIngredient && (
            <div className={styles.editIngredientForm}>
              <div className={styles.formGroup}>
                <label>Nome *</label>
                <input
                  type="text"
                  value={editingIngredient.name}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nome do ingrediente"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Unidade *</label>
                  <select
                    value={editingIngredient.unit}
                    onChange={(e) =>
                      setEditingIngredient({
                        ...editingIngredient,
                        unit: e.target.value,
                      })
                    }
                  >
                    <option value="g">Gramas (g)</option>
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="L">Litros (L)</option>
                    <option value="un">Unidades (un)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Custo Unitário *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingIngredient.unitCost}
                    onChange={(e) =>
                      setEditingIngredient({
                        ...editingIngredient,
                        unitCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Categoria</label>
                <input
                  type="text"
                  value={editingIngredient.category || ""}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      category: e.target.value,
                    })
                  }
                  placeholder="Ex: Secos, Líquidos"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Fornecedor</label>
                <input
                  type="text"
                  value={editingIngredient.supplier || ""}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      supplier: e.target.value,
                    })
                  }
                  placeholder="Ex: Fornecedor A"
                />
              </div>
              
              {editingIngredient.createdAt && (
                <div className={styles.ingredientDates}>
                  <small>
                    Criado em: {new Date(editingIngredient.createdAt).toLocaleDateString()}
                  </small>
                  {editingIngredient.updatedAt && (
                    <small>
                      Atualizado em: {new Date(editingIngredient.updatedAt).toLocaleDateString()}
                    </small>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={styles.modalEditIngredientFooter}>
          <ButtonCancelar
            variant="outline"
            onClick={() => {
              setModalEditIngredientShow(false);
              setEditingIngredient(null);
            }}
            CancelLabel="Cancelar"
          />
          <button
            className={styles.btnSaveIngredient}
            onClick={handleSaveIngredient}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Ingrediente do Produto (NOVO) */}
      <Modal
        show={modalEditProductIngredientShow}
        onHide={() => {
          setModalEditProductIngredientShow(false);
          setEditingProductIngredient(null);
        }}
        size="xl"
        centered
        className={styles.modalEditProductIngredient}
      >
        <Modal.Header closeButton className={styles.modalEditProductIngredientHeader}>
          <Modal.Title className={styles.modalEditProductIngredientTitle}>
            <PencilIcon size={20} />
            Editar Ingrediente do Produto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalEditProductIngredientBody}>
          {editingProductIngredient && (
            <div className={styles.editProductIngredientForm}>
              <div className={styles.ingredientInfo}>
                <h6>{editingProductIngredient.ingredient.name}</h6>
                <p className={styles.ingredientDetails}>
                  <small>
                    Custo unitário: R$ {editingProductIngredient.ingredient.unitCost.toFixed(2)}/
                    {editingProductIngredient.ingredient.unit}
                  </small>
                </p>
              </div>
              
              <div className={styles.formGroup}>
                <label>Quantidade *</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="0.001"
                    value={editProductIngredientForm.quantity}
                    onChange={(e) => 
                      setEditProductIngredientForm({
                        ...editProductIngredientForm,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="Ex: 500"
                  />
                  <select
                    value={editProductIngredientForm.unit}
                    onChange={(e) => 
                      setEditProductIngredientForm({
                        ...editProductIngredientForm,
                        unit: e.target.value,
                      })
                    }
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="un">un</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Notas (opcional)</label>
                <input
                  type="text"
                  value={editProductIngredientForm.notes}
                  onChange={(e) => 
                    setEditProductIngredientForm({
                      ...editProductIngredientForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Ex: Usar farinha orgânica"
                />
              </div>
              
              {editProductIngredientForm.quantity && (
                <div className={styles.costPreview}>
                  <h6>Cálculo do Custo:</h6>
                  <div className={styles.costDetails}>
                    <span>
                      {editProductIngredientForm.quantity} {editProductIngredientForm.unit} × 
                      R$ {editingProductIngredient.ingredient.unitCost.toFixed(2)}/
                      {editingProductIngredient.ingredient.unit}
                    </span>
                    {editProductIngredientForm.unit !== editingProductIngredient.ingredient.unit && (
                      <span className={styles.conversionNote}>
                        (Conversão necessária: {editProductIngredientForm.unit} → {editingProductIngredient.ingredient.unit})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={styles.modalEditProductIngredientFooter}>
          <ButtonCancelar
            variant="outline"
            onClick={() => {
              setModalEditProductIngredientShow(false);
              setEditingProductIngredient(null);
            }}
            CancelLabel="Cancelar"
          />
          <button
            className={styles.btnSaveProductIngredient}
            onClick={handleSaveProductIngredient}
            disabled={loading || !editProductIngredientForm.quantity}
          >
            <FloppyDiskIcon size={16} />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modais de Feedback (mantidos iguais) */}
      <Modal
        show={successModalShow}
        onHide={() => setSuccessModalShow(false)}
        size="sm"
        centered
        className={styles.successModal}
      >
        <Modal.Body className={styles.successBody}>
          <div className={styles.successIcon}>✓</div>
          <h5>Sucesso!</h5>
          <p>{successMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.successFooter}>
          <button
            className={styles.successButton}
            onClick={() => setSuccessModalShow(false)}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={warningModalShow}
        onHide={() => setWarningModalShow(false)}
        size="sm"
        centered
        className={styles.warningModal}
      >
        <Modal.Body className={styles.warningBody}>
          <div className={styles.warningIcon}>⚠</div>
          <h5>Atenção</h5>
          <p>{warningMessage}</p>
        </Modal.Body>
        <Modal.Footer className={styles.warningFooter}>
          <button
            className={styles.warningButton}
            onClick={() => setWarningModalShow(false)}
          >
            Entendi
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}