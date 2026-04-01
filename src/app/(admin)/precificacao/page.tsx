"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Card, { FormData } from "@/components/Cards/Card";
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
  GearIcon,
} from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import { PageActions } from "@/contexts/PageActions";
import toast from "react-hot-toast";

// ==================== TIPOS (mantidos iguais) ====================
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

// ==================== COMPONENTE PRINCIPAL ====================
export default function PrecificacaoPage() {
  // Estados principais (iguais)
  const [modalShow, setModalShow] = useState(false);
  const [modalAddIngredientShow, setModalAddIngredientShow] = useState(false); // para adicionar ao produto
  const [modalEditIngredientShow, setModalEditIngredientShow] = useState(false); // para editar ingrediente do produto
  const [modalCreateIngredientShow, setModalCreateIngredientShow] = useState(false); // para criar novo na matriz
  const [loading, setLoading] = useState(false);
  const [produtosParaCalcular, setProdutosParaCalcular] = useState<ProductForPricing[]>([]);
  const [produtosCalculados, setProdutosCalculados] = useState<ProductForPricing[]>([]);
  const [selectProduto, setSelectProduto] = useState<ProductForPricing | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"para-calcular" | "calculados" | "insumos">("para-calcular");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Estados para o modal de adicionar ingrediente (busca)
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientForm, setIngredientForm] = useState({ quantity: "", unit: "g", notes: "" });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  // Estados para editar ingrediente do produto
  const [editingProductIngredient, setEditingProductIngredient] = useState<ProductIngredient | null>(null);
  const [editFormData, setEditFormData] = useState({ quantity: "", unit: "g", notes: "" });

  // Estado para criar novo ingrediente na matriz
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "g",
    unitCost: "",
    category: "",
    supplier: "",
  });

  const pageActions = useContext(PageActions);
  const API_URL = api;

  // ==================== FUNÇÕES AUXILIARES (conversão, cálculo) ====================
  const getImageUrl = (fotoUrl: string | undefined | null): string => {
    if (!fotoUrl) return "/placeholder.png";
    const nomeArquivo = fotoUrl.replace(/^\/?imagens\//, '');
    return `${API_URL}/imagens/${nomeArquivo}`;
  };

  const safeToFixed = (value: number | undefined | null, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) return "0.00";
    return value.toFixed(decimals);
  };

  const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
    const conversions: Record<string, Record<string, number>> = {
      'kg': { 'g': 1000, 'mg': 1000000, 'kg': 1 },
      'g': { 'kg': 0.001, 'mg': 1000, 'g': 1 },
      'mg': { 'kg': 0.000001, 'g': 0.001, 'mg': 1 },
      'L': { 'ml': 1000, 'cl': 100, 'L': 1 },
      'ml': { 'L': 0.001, 'cl': 0.1, 'ml': 1 },
      'cl': { 'L': 0.01, 'ml': 10, 'cl': 1 },
      'un': { 'un': 1 }
    };
    if (fromUnit === toUnit) return value;
    if (conversions[fromUnit]?.[toUnit]) return value * conversions[fromUnit][toUnit];
    if (conversions[toUnit]?.[fromUnit]) return value / conversions[toUnit][fromUnit];
    console.warn(`Conversão não suportada: ${fromUnit} para ${toUnit}`);
    return value;
  };

  const getCalculatedCost = (item: ProductIngredient): number => {
    try {
      const convertedQty = convertUnit(item.quantity, item.unit, item.ingredient.unit);
      return item.ingredient.unitCost * convertedQty;
    } catch {
      return item.totalCost;
    }
  };

  const calculateTotalCost = (): number => {
    if (!selectProduto) return 0;
    return selectProduto.ingredients.reduce((sum, item) => sum + getCalculatedCost(item), 0);
  };

  const calculateCostPerUnit = (): number => {
    const total = calculateTotalCost();
    if (!selectProduto?.yield || selectProduto.yield <= 0) return total;
    return total / selectProduto.yield;
  };

  // ==================== CHAMADAS API ====================
  const fetchProdutosParaCalcular = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/pricing/products/not-calculated");
      setProdutosParaCalcular(response.data);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para Precificação.", { id: "page_error" });
      } else {
        toast.error(error.response?.data?.error || "Erro ao carregar produtos", { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProdutosCalculados = useCallback(async () => {
    try {
      const response = await api.get("/pricing/products/calculated");
      setProdutosCalculados(response.data);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para Precificação.", { id: "page_error" });
      } else {
        toast.error(error.response?.data?.error || "Erro ao carregar produtos calculados", { id: "page_error" });
      }
    }
  }, []);

  const fetchIngredients = useCallback(async (search = "") => {
    try {
      const params = search ? { search } : {};
      const response = await api.get("/pricing/ingredients", { params });
      setIngredients(response.data.ingredients || response.data);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para Precificação.", { id: "page_error" });
      } else {
        toast.error(error.response?.data?.error || "Erro ao buscar ingredientes", { id: "page_error" });
      }
    }
  }, []);

  const loadProdutoDetalhes = async (productId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/pricing/products/${productId}`);
      setSelectProduto(response.data);
      setModalShow(true);
      setCalculationResult(null);
      // Resetar abas internas para a primeira
      setActiveTabInterna("ingredientes");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao carregar produto");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar ingrediente ao produto
  const handleAddIngredientToProduct = async () => {
    if (!selectedIngredient || !ingredientForm.quantity || !selectProduto) {
      toast.error("Selecione um ingrediente e informe a quantidade");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/pricing/products/${selectProduto.id}/ingredients`, {
        ingredientId: selectedIngredient.id,
        quantity: parseFloat(ingredientForm.quantity),
        unit: ingredientForm.unit,
        notes: ingredientForm.notes,
      });
      await loadProdutoDetalhes(selectProduto.id);
      setModalAddIngredientShow(false);
      setSelectedIngredient(null);
      setIngredientForm({ quantity: "", unit: "g", notes: "" });
      setSearchIngredient("");
      toast.success("Ingrediente adicionado");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao adicionar");
    } finally {
      setLoading(false);
    }
  };

  // Remover ingrediente do produto
  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!selectProduto) return;
    if (!window.confirm("Remover este ingrediente?")) return;
    try {
      await api.delete(`/pricing/products/${selectProduto.id}/ingredients/${ingredientId}`);
      await loadProdutoDetalhes(selectProduto.id);
      toast.success("Ingrediente removido");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao remover");
    }
  };

  // Editar ingrediente do produto (abre modal)
  const handleEditProductIngredient = (item: ProductIngredient) => {
    setEditingProductIngredient(item);
    setEditFormData({
      quantity: item.quantity.toString(),
      unit: item.unit,
      notes: item.notes || "",
    });
    setModalEditIngredientShow(true);
  };

  // Salvar edição do ingrediente do produto
  const handleSaveProductIngredient = async () => {
    if (!editingProductIngredient || !selectProduto) return;
    if (!editFormData.quantity) {
      toast.error("Informe a quantidade");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/pricing/products/${selectProduto.id}/ingredients/${editingProductIngredient.id}`, {
        quantity: parseFloat(editFormData.quantity),
        unit: editFormData.unit,
        notes: editFormData.notes,
      });
      await loadProdutoDetalhes(selectProduto.id);
      setModalEditIngredientShow(false);
      setEditingProductIngredient(null);
      toast.success("Ingrediente atualizado");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  // Criar novo ingrediente na matriz
  const handleCreateIngredient = async () => {
    if (!newIngredient.name || !newIngredient.unit || !newIngredient.unitCost) {
      toast.error("Preencha nome, unidade e custo");
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
      toast.success("Ingrediente cadastrado");
      setNewIngredient({ name: "", unit: "g", unitCost: "", category: "", supplier: "" });
      setModalCreateIngredientShow(false);
      await fetchIngredients();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  // Excluir ingrediente da matriz
  const handleDeleteIngredient = async (ingredientId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este ingrediente?")) return;
    setLoading(true);
    try {
      await api.delete(`/pricing/ingredients/${ingredientId}`);
      toast.success("Ingrediente excluído");
      await fetchIngredients();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Erro ao excluir";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Simular preço
  const handleSimulatePrice = async (data: FormData) => {
    if (!selectProduto) return;
    setLoading(true);
    try {
      const strategy = data.strategy as string;
      const payload: any = {
        expensePercent: parseFloat(data.expensePercent as string) || 0,
        taxPercent: parseFloat(data.taxPercent as string) || 0,
        minProfit: parseFloat(data.minProfit as string) || 0,
      };
      if (strategy === "markup" && data.markupPercent) {
        payload.markupPercent = parseFloat(data.markupPercent as string);
      } else if (strategy === "margin" && data.profitPercent) {
        payload.profitPercent = parseFloat(data.profitPercent as string);
      } else {
        throw new Error("Preencha os campos corretamente");
      }
      const response = await api.post(`/pricing/products/${selectProduto.id}/simulate`, payload);
      setCalculationResult(response.data);
      setActiveTabInterna("resultado"); // vai para a aba de resultado
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Erro na simulação");
    } finally {
      setLoading(false);
    }
  };

  // Salvar preço calculado (a partir da simulação)
  const handleCalculateFromSimulation = async () => {
    if (!selectProduto || !calculationResult) {
      toast.error("Faça uma simulação primeiro");
      return;
    }
    if (!window.confirm("Deseja salvar este preço calculado?")) return;
    setLoading(true);
    try {
      // Usa os mesmos percentuais da simulação (pode ser adaptado)
      const pricingData = {
        markupPercent: calculationResult.markup,
        profitPercent: calculationResult.profitMargin,
        expensePercent: 20, // ou pegar do formulário se desejar
        taxPercent: 15,
        minProfit: 0,
      };
      await api.post(`/pricing/products/${selectProduto.id}/calculate`, pricingData);
      toast.success("Preço salvo com sucesso!");
      setModalShow(false);
      setSelectProduto(null);
      setCalculationResult(null);
      await Promise.all([fetchProdutosParaCalcular(), fetchProdutosCalculados()]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  // Resetar preço de um produto já calculado
  const handleResetPrice = async () => {
    if (!selectProduto) return;
    if (!window.confirm("Resetar o preço deste produto?")) return;
    setLoading(true);
    try {
      await api.post(`/pricing/products/${selectProduto.id}/reset`);
      toast.success("Preço resetado");
      setModalShow(false);
      await Promise.all([fetchProdutosParaCalcular(), fetchProdutosCalculados()]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao resetar");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDERIZAÇÃO DAS LISTAS PRINCIPAIS ====================
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
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
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
              <strong>R$ {safeToFixed(produto.costPrice)}</strong>
            </div>
            <div className={styles.priceItem}>
              <span>Venda:</span>
              <strong className={styles.salePrice}>
                R$ {safeToFixed(produto.salePrice)}
              </strong>
            </div>
            <div className={styles.priceItem}>
              <span>Markup:</span>
              <strong>{safeToFixed(produto.markupPercent, 1)}%</strong>
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
        </div>
        <div className={styles.ingredientItemFooter}>
          {/* Editar ingrediente da matriz poderia abrir um modal simples, mas omitido para manter foco */}
          <button
            className={styles.btnExcluir}
            onClick={() => handleDeleteIngredient(ingredient.id)}
            title="Excluir ingrediente"
          >
            <TrashSimpleIcon size={14} /> Excluir
          </button>
        </div>
      </div>
    ));
  }, [ingredients]);

  // ==================== MODAL PRINCIPAL COM ABAS ====================
  const [activeTabInterna, setActiveTabInterna] = useState<string>("ingredientes");

  const renderPricingModal = () => {
    if (!selectProduto) return null;
    const totalCost = calculateTotalCost();
    const costPerUnit = calculateCostPerUnit();

    return (
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectProduto(null);
          setCalculationResult(null);
        }}
        size="xl"
        centered
        className={styles.modalPrecificacao}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body className={styles.modalPrecificacaoBody}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>
            {selectProduto.name}
            {selectProduto.priceStatus === "CALCULATED" && (
              <span className={styles.badgeCalculatedInline}>Preço Calculado</span>
            )}
          </h2>
          <Tabs
            activeKey={activeTabInterna}
            onSelect={(k) => k && setActiveTabInterna(k)}
            className={styles.modalTabs}
            fill
          >
            {/* Aba 1: Ingredientes */}
            <Tab eventKey="ingredientes" title="Ingredientes">
              <div className={styles.tabContent}>
                <div className={styles.ingredientsHeader}>
                  <h5>Lista de Ingredientes</h5>
                  <button
                    className={styles.btnAddIngredient}
                    onClick={() => {
                      setSearchIngredient("");
                      setSelectedIngredient(null);
                      setIngredientForm({ quantity: "", unit: "g", notes: "" });
                      setModalAddIngredientShow(true);
                    }}
                  >
                    <PlusIcon size={16} /> Adicionar Ingrediente
                  </button>
                </div>

                {selectProduto.ingredients.length === 0 ? (
                  <div className={styles.emptyIngredients}>
                    <p>Nenhum ingrediente adicionado a este produto.</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.ingredientsTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Ingrediente</th>
                            <th>Quantidade</th>
                            <th>Custo Unitário</th>
                            <th>Custo Total</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectProduto.ingredients.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className={styles.ingredientName}>
                                  <strong>{item.ingredient.name}</strong>
                                  <small>{item.ingredient.category}</small>
                                </div>
                              </td>
                              <td>
                                {item.quantity} {item.unit}
                                {item.ingredient.unit !== item.unit && (
                                  <div className={styles.unitConversion}>
                                    <small>
                                      (≈ {convertUnit(item.quantity, item.unit, item.ingredient.unit).toFixed(3)} {item.ingredient.unit})
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td>
                                R$ {item.ingredient.unitCost.toFixed(2)}/{item.ingredient.unit}
                                {item.ingredient.unit !== item.unit && (
                                  <div className={styles.unitConversion}>
                                    <small>
                                      (R$ {(item.ingredient.unitCost * convertUnit(1, item.ingredient.unit, item.unit)).toFixed(4)}/{item.unit})
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td>
                                <strong>R$ {getCalculatedCost(item).toFixed(2)}</strong>
                              </td>
                              <td>
                                <div className={styles.ingredientActions}>
                                  <button
                                    className={styles.btnEdit}
                                    onClick={() => handleEditProductIngredient(item)}
                                    title="Editar"
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={styles.costSummary}>
                      <div className={styles.costItem}>
                        <span>Custo Total Ingredientes:</span>
                        <strong>R$ {totalCost.toFixed(2)}</strong>
                      </div>
                      {selectProduto.yield && selectProduto.yield > 0 && (
                        <>
                          <div className={styles.costItem}>
                            <span>Rendimento:</span>
                            <strong>{selectProduto.yield} unidades</strong>
                          </div>
                          <div className={styles.costItem}>
                            <span>Custo por Unidade:</span>
                            <strong>R$ {costPerUnit.toFixed(2)}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Tab>

            {/* Aba 2: Simular Preço */}
            <Tab eventKey="simular" title="Simular Preço">
              <div className={styles.tabContent}>
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
                      placeholder: "Ex: 50",
                      condition: (data: any) => data.strategy === "markup",
                      step: "0.1",
                    },
                    {
                      name: "profitPercent",
                      label: "Margem de Lucro (%)",
                      type: "number",
                      placeholder: "Ex: 30",
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
                  submitLabel="Simular"
                  loading={loading}
                  showCancel={false}
                />
              </div>
            </Tab>

            {/* Aba 3: Resultado (desabilitada se não houver resultado) */}
            <Tab
              eventKey="resultado"
              title="Resultado"
              disabled={!calculationResult}
            >
              <div className={styles.tabContent}>
                {calculationResult ? (
                  <div className={styles.resultContainer}>
                    <div className={styles.resultHeader}>
                      <ScalesIcon size={24} />
                      <h5>Resultado da Simulação</h5>
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
                      <div className={styles.breakdown}>
                        <h6>Detalhamento:</h6>
                        <div>Ingredientes: R$ {calculationResult.breakdown.ingredients?.toFixed(2)}</div>
                        <div>Despesas: R$ {calculationResult.breakdown.expenses?.toFixed(2)}</div>
                        <div>Impostos: R$ {calculationResult.breakdown.taxes?.toFixed(2)}</div>
                      </div>
                    )}
                    <div className={styles.resultActions}>
                      <button
                        className={styles.btnSaveCalculation}
                        onClick={handleCalculateFromSimulation}
                        disabled={loading}
                      >
                        <ScalesIcon size={16} />
                        {selectProduto?.priceStatus === "CALCULATED"
                          ? "Atualizar Preço"
                          : "Salvar Preço"}
                      </button>
                      <button
                        className={styles.btnNewSimulation}
                        onClick={() => {
                          setCalculationResult(null);
                          setActiveTabInterna("simular");
                        }}
                      >
                        <CalculatorIcon size={16} />
                        Nova Simulação
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="emptyStateStandard">
                    <p>Faça uma simulação primeiro.</p>
                    <button
                      className={styles.btnNewSimulation}
                      onClick={() => setActiveTabInterna("simular")}
                    >
                      Ir para Simular
                    </button>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>

          {/* Botão de reset para produtos já calculados (fora das abas) */}
          {selectProduto?.priceStatus === "CALCULATED" && (
            <div className={styles.calculatedActionsFooter}>
              <button className={styles.btnReset} onClick={handleResetPrice} disabled={loading}>
                <XIcon size={16} /> Resetar Preço
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  };

  // ==================== MODAIS AUXILIARES ====================

  // Modal para adicionar ingrediente ao produto (busca)
  const renderAddIngredientModal = () => (
    <Modal
      show={modalAddIngredientShow}
      onHide={() => setModalAddIngredientShow(false)}
      size="lg"
      centered
      className={styles.modalPrecificacao}
      contentClassName="globalModalContentRounded"
    >
      <Modal.Body className={styles.modalPrecificacaoBody}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>Adicionar Ingrediente</h2>
        <div className={styles.addIngredientModalContent}>
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon size={20} />
            <input
              type="text"
              placeholder="Buscar ingrediente..."
              value={searchIngredient}
              onChange={(e) => {
                setSearchIngredient(e.target.value);
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(() => fetchIngredients(e.target.value), 300);
                setSearchTimeout(timeout);
              }}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.searchResults}>
            {searchIngredient === "" ? (
              // Mostrar todos os ingredientes quando a busca está vazia
              ingredients.length === 0 ? (
                <p className={styles.noResults}>Nenhum ingrediente cadastrado.</p>
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
                    <div>
                      R$ {ing.unitCost.toFixed(2)}/{ing.unit}
                    </div>
                  </div>
                ))
              )
            ) : (
              // Mostrar resultados da busca
              ingredients.length === 0 ? (
                <p className={styles.noResults}>Nenhum ingrediente encontrado para "{searchIngredient}".</p>
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
                    <div>
                      R$ {ing.unitCost.toFixed(2)}/{ing.unit}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
          {selectedIngredient && (
            <div className={styles.ingredientForm}>
              <div className={styles.formGroup}>
                <label>Quantidade</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="0.001"
                    value={ingredientForm.quantity}
                    onChange={(e) =>
                      setIngredientForm({ ...ingredientForm, quantity: e.target.value })
                    }
                  />
                  <select
                    value={ingredientForm.unit}
                    onChange={(e) =>
                      setIngredientForm({ ...ingredientForm, unit: e.target.value })
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
                  value={ingredientForm.notes}
                  onChange={(e) =>
                    setIngredientForm({ ...ingredientForm, notes: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div className={styles.orSeparator}>
            <span>ou</span>
          </div>
          <button
            className={styles.btnCreateNew}
            onClick={() => {
              setModalAddIngredientShow(false);
              setModalCreateIngredientShow(true);
            }}
          >
            <PlusIcon size={14} /> Cadastrar novo ingrediente
          </button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar variant="outline" onClick={() => setModalAddIngredientShow(false)} CancelLabel="Cancelar" />
        <button
          className={styles.btnAddIngredientSubmit}
          onClick={handleAddIngredientToProduct}
          disabled={loading || !selectedIngredient || !ingredientForm.quantity}
        >
          Adicionar
        </button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para editar ingrediente do produto
  const renderEditIngredientModal = () => (
    <Modal
      show={modalEditIngredientShow}
      onHide={() => {
        setModalEditIngredientShow(false);
        setEditingProductIngredient(null);
      }}
      size="lg"
      centered
      className={styles.modalPrecificacao}
      contentClassName="globalModalContentRounded"
    >
      <Modal.Body className={styles.modalPrecificacaoBody}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>Editar Ingrediente</h2>
        {editingProductIngredient && (
          <div className={styles.editIngredientForm}>
            <p>
              <strong>{editingProductIngredient.ingredient.name}</strong> (R$ {editingProductIngredient.ingredient.unitCost.toFixed(2)}/{editingProductIngredient.ingredient.unit})
            </p>
            <div className={styles.formGroup}>
              <label>Quantidade</label>
              <div className={styles.inputWithUnit}>
                <input
                  type="number"
                  step="0.001"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                />
                <select
                  value={editFormData.unit}
                  onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
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
              <label>Notas</label>
              <input
                type="text"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar variant="outline" onClick={() => setModalEditIngredientShow(false)} CancelLabel="Cancelar" />
        <button
          className={styles.btnSave}
          onClick={handleSaveProductIngredient}
          disabled={loading}
        >
          Salvar
        </button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para criar novo ingrediente na matriz
  const renderCreateIngredientModal = () => (
    <Modal
      show={modalCreateIngredientShow}
      onHide={() => setModalCreateIngredientShow(false)}
      size="lg"
      centered
      className={styles.modalPrecificacao}
      contentClassName="globalModalContentRounded"
    >
      <Modal.Body className={styles.modalPrecificacaoBody}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 16px 0", letterSpacing: "-0.01em" }}>Cadastrar Novo Insumo</h2>
        <div className={styles.newIngredientForm}>
          <div className={styles.formGroup}>
            <label>Nome *</label>
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Unidade *</label>
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="un">un</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Custo Unitário *</label>
              <input
                type="number"
                step="0.01"
                value={newIngredient.unitCost}
                onChange={(e) => setNewIngredient({ ...newIngredient, unitCost: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Categoria</label>
            <input
              type="text"
              value={newIngredient.category}
              onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Fornecedor</label>
            <input
              type="text"
              value={newIngredient.supplier}
              onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <ButtonCancelar variant="outline" onClick={() => setModalCreateIngredientShow(false)} CancelLabel="Cancelar" />
        <button
          className={styles.btnAddIngredientSubmit}
          onClick={handleCreateIngredient}
          disabled={loading}
        >
          Cadastrar
        </button>
      </Modal.Footer>
    </Modal>
  );

  // ==================== EFEITOS INICIAIS ====================
  useEffect(() => {
    pageActions.setShowAddButton(false);
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProdutosParaCalcular(),
          fetchProdutosCalculados(),
          fetchIngredients(),
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
      toast.dismiss("page_error");
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  // ==================== RENDER PRINCIPAL ====================
  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Abas principais */}
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
            Insumos ({ingredients.length})
          </button>
        </div>

        {/* Conteúdo das abas principais */}
        <div className={styles.productsGrid}>
          {loading ? (
            <div className="emptyStateStandard">Carregando...</div>
          ) : activeTab === "para-calcular" ? (
            produtosParaCalcular.length === 0 ? (
              <div className="emptyStateStandard">
                <h3>Nenhum produto aguardando precificação</h3>
              </div>
            ) : (
              renderProdutosParaCalcular
            )
          ) : activeTab === "calculados" ? (
            produtosCalculados.length === 0 ? (
              <div className="emptyStateStandard">
                <h3>Nenhum produto com preço calculado</h3>
              </div>
            ) : (
              renderProdutosCalculados
            )
          ) : (
            <div className={styles.ingredientsListContainer}>
              <div className={styles.ingredientsListHeader}>
                <h4>Matriz de Insumos</h4>
                <button
                  className={styles.btnAddIngredient}
                  onClick={() => setModalCreateIngredientShow(true)}
                >
                  <PlusIcon size={16} /> Novo Insumo
                </button>
              </div>
              <div className={styles.ingredientsGrid}>{renderIngredientsList}</div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {renderPricingModal()}
      {renderAddIngredientModal()}
      {renderEditIngredientModal()}
      {renderCreateIngredientModal()}
    </>
  );
}