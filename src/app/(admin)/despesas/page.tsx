'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Card from '@/components/Cards/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import api from '@/services/api';
import FixedExpense from '@/models/FixedExpenses';
import CardFixedExpense from '@/components/Cards/CardFixedExpense';
import styles from './styles.module.css';
import ButtonCancelar from '@/components/Buttons/ButtonCancel';
import { PageActions } from '@/contexts/PageActions';
import toast from 'react-hot-toast';

const categoryOptions = [
  { value: 'Ingredientes', label: 'Ingredientes' },
  { value: 'Equipamentos', label: 'Equipamentos' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Aluguel', label: 'Aluguel' },
  { value: 'Energia', label: 'Energia' },
  { value: 'Água', label: 'Água' },
  { value: 'Internet', label: 'Internet' },
  { value: 'Salários', label: 'Salários' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Outros', label: 'Outros' },
];

export default function FixedExpensesPage() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | undefined>();
  const [loading, setLoading] = useState(false);

  const [modalAddShow, setModalAddShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalDeleteShow, setModalDeleteShow] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [draftExpense, setDraftExpense] = useState<any>({});

  // Extrai as funções necessárias (estáveis)
  const { 
    setShowAddButton, 
    setHandleAdd, 
    setShowFilterButton, 
    setFilterOptions, 
    setHandleFilter,
    searchQuery,
    setSearchQuery
  } = useContext(PageActions);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const currentYear = new Date().getFullYear();
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // 1. Filtra por mês: a busca agora exige que a despesa REALMENTE exista naquele mês (Baseado na Opção A)
  // O Backend será responsável por criar as despesas todo dia 1º, então o front só confere o mês e o ano.
  const despesasDoMes = expenses.filter(exp => {
    const [datePart] = exp.date.split('T');
    const [year, month] = datePart.split('-').map(Number);
    return year === currentYear && (month - 1) === selectedMonth;
  });

  // 2. Aplica o filtro selecionado no TopBar (Todas/Recorrentes/Únicas) e a busca por texto
  const despesasFiltradas = despesasDoMes.filter((e) => {
    // 1. Filtro de Texto (Busca)
    if (searchQuery && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Filtro de Tipo
    if (activeFilter === "recurring") return e.recurring === true;
    if (activeFilter === "unique") return e.recurring === false;
    return true; // "all"
  });

  // 3. Calcula o total dinamicamente
  const currentMonthlyTotal = despesasFiltradas.reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);

  // Configura o botão "Adicionar" e filtros do layout global
  useEffect(() => {
    setShowAddButton(true);
    setHandleAdd(() => setModalAddShow(true));

    setShowFilterButton(true);
    setFilterOptions([
      { label: "Todas", value: "all" },
      { label: "Recorrentes", value: "recurring" },
      { label: "Únicas", value: "unique" },
    ]);
    setHandleFilter((value: string) => {
      setActiveFilter(value);
    });

    return () => {
      setShowFilterButton(false);
      setFilterOptions([]);
      setSearchQuery("");
      setHandleAdd(() => {}); // limpa ao desmontar
    };
  }, [setShowAddButton, setHandleAdd, setShowFilterButton, setFilterOptions, setHandleFilter]); // dependências estáveis → executa apenas uma vez

  // Carrega as despesas do backend
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/fixedExpenses');
      setExpenses(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar despesas:', error);
      const msg = error.response?.data?.error || error.response?.data?.erro;
      if (msg === "Usuário não autorizado") {
        toast.error("Você não tem permissão para visualizar Despesas.", { id: "page_error" });
      } else {
        toast.error('Erro ao carregar as despesas.', { id: "page_error" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
    return () => {
      toast.dismiss("page_error");
    };
  }, [loadExpenses]);

  const handleAddSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...draftExpense,
        value: parseFloat(draftExpense.value),
        date: draftExpense.date ? new Date(draftExpense.date).toISOString() : new Date().toISOString(),
        recurring: draftExpense.recurring === 'true' || draftExpense.recurring === true,
      };
      await api.post('/fixedExpenses', payload);
      await loadExpenses();
      toast.success('Despesa cadastrada com sucesso!');
      setModalAddShow(false);
      setDraftExpense({});
    } catch (error: any) {
      console.error('Erro ao cadastrar despesa:', error);
      toast.error(error.response?.data?.message || 'Erro ao cadastrar despesa.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedExpense) return;
    setLoading(true);
    try {
      const payload = {
        ...draftExpense,
        value: parseFloat(draftExpense.value),
        date: draftExpense.date ? new Date(draftExpense.date).toISOString() : undefined,
        recurring: draftExpense.recurring === 'true' || draftExpense.recurring === true,
      };
      await api.put(`/fixedExpenses/${selectedExpense.id}`, payload);
      await loadExpenses();
      toast.success('Despesa atualizada com sucesso!');
      setModalEditShow(false);
      setSelectedExpense(undefined);
      setDraftExpense({});
    } catch (error: any) {
      console.error('Erro ao editar despesa:', error);
      toast.error(error.response?.data?.message || 'Erro ao editar despesa.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    setLoading(true);
    try {
      await api.delete(`/fixedExpenses/${selectedExpense.id}`);
      await loadExpenses();
      toast.success('Despesa removida com sucesso!');
      setModalDeleteShow(false);
      setSelectedExpense(undefined);
    } catch (error: any) {
      console.error('Erro ao deletar despesa:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar despesa.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (expense: FixedExpense) => {
    setSelectedExpense(expense);
    setDraftExpense({
      description: expense.description,
      value: expense.value,
      date: expense.date ? expense.date.split('T')[0] : '',
      recurring: expense.recurring ? 'true' : 'false',
      category: expense.category,
      note: expense.note
    });
    setModalEditShow(true);
  };

  const openDeleteModal = (expense: FixedExpense) => {
    setSelectedExpense(expense);
    setModalDeleteShow(true);
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Filtro de Meses */}
        <div className={styles.monthSelector}>
          {MONTHS.map((m, i) => (
            <button 
              key={i} 
              className={`${styles.monthBtn} ${selectedMonth === i ? styles.monthBtnActive : ''}`}
              onClick={() => setSelectedMonth(i)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Card de resumo mensal */}
        <div className={styles.monthlySummaryCard}>
          <h4>Total de Despesas no Mês</h4>
          <p className={styles.monthlyValue}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMonthlyTotal)}
          </p>
        </div>

        {despesasFiltradas.length === 0 && !loading ? (
          <div className="emptyStateStandard">
            <h3>
              {activeFilter !== "all"
                ? "Nenhuma despesa encontrada para este filtro"
                : "Nenhuma despesa encontrada"}
            </h3>
            <p>
              {activeFilter === "all"
                ? "Cadastre sua primeira despesa fixa para começar"
                : "Tente outro filtro"}
            </p>
          </div>
        ) : (
          despesasFiltradas.map(expense => (
            <div key={expense.id} className={styles.divContainerCliente}>
              <CardFixedExpense
                expense={expense}
                actions={[
                  { label: 'Editar', onClick: () => openEditModal(expense), variant: 'edit' },
                  { label: 'Excluir', onClick: () => openDeleteModal(expense), variant: 'delete' },
                ]}
              />
            </div>
          ))
        )}
      </div>

      {/* Modal de adicionar */}
      <Modal 
        show={modalAddShow} 
        onHide={() => setModalAddShow(false)} 
        size="xl" 
        centered 
        className={styles.modalExpense} 
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body style={{ padding: 0 }}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>Nova Despesa Fixa</h2>
            <p className={styles.stepSubtitle}>Cadastre uma nova despesa informando os valores e detalhes de recorrência</p>
          </div>

          <div className={styles.splitLayout}>
            {/* Painel Esquerdo: Dados da Despesa */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h5>Informações da Despesa</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  title=""
                  fields={[
                    { name: 'description', label: 'Descrição', type: 'text' },
                    { name: 'value', label: 'Valor (R$)', type: 'number', step: '0.01' },
                    { name: 'date', label: 'Data de Vencimento', type: 'date', value: new Date().toISOString().split('T')[0] },
                    { name: 'category', label: 'Categoria', type: 'select', options: categoryOptions },
                  ]}
                  showSubmit={false}
                  showCancel={false}
                  onChange={(name, value) => setDraftExpense((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>

            {/* Painel Direito: Configurações Adicionais */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h5>Configurações Extras</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  title=""
                  fields={[
                    {
                      name: 'recurring',
                      label: 'Despesa Recorrente?',
                      type: 'select',
                      options: [
                        { value: 'false', label: 'Não (Única)' },
                        { value: 'true', label: 'Sim (Mensal)' },
                      ],
                    },
                    { name: 'note', label: 'Observações/Notas', type: 'textarea' },
                  ]}
                  onSubmit={handleAddSubmit}
                  submitLabel="Finalizar Cadastro"
                  loading={loading}
                  showCancel={false}
                  onChange={(name, value) => setDraftExpense((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnActionBack} onClick={() => setModalAddShow(false)}>
              Cancelar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de edição */}
      <Modal
        show={modalEditShow}
        onHide={() => { setModalEditShow(false); setSelectedExpense(undefined); }}
        size="xl"
        centered
        className={styles.modalExpense}
        contentClassName="globalModalContentRounded"
      >
        <Modal.Body style={{ padding: 0 }}>
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>Editar Despesa</h2>
            <p className={styles.stepSubtitle}>Ajuste os valores ou configurações da despesa selecionada</p>
          </div>

          <div className={styles.splitLayout}>
            {/* Painel Esquerdo: Dados */}
            <div className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h5>Informações Básicas</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  key={`edit-left-${selectedExpense?.id}`}
                  title=""
                  fields={[
                    { name: 'description', value: selectedExpense?.description || '', label: 'Descrição', type: 'text' },
                    { name: 'value', value: selectedExpense?.value || '', label: 'Valor (R$)', type: 'number', step: '0.01' },
                    { name: 'date', value: selectedExpense?.date ? selectedExpense.date.split('T')[0] : '', label: 'Data de Vencimento', type: 'date' },
                    { name: 'category', value: selectedExpense?.category || '', label: 'Categoria', type: 'select', options: categoryOptions },
                  ]}
                  showSubmit={false}
                  showCancel={false}
                  onChange={(name, value) => setDraftExpense((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>

            {/* Painel Direito: Detalhes e Ações */}
            <div className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h5>Detalhes e Ações</h5>
              </div>
              <div className={styles.panelContent}>
                <Card
                  key={`edit-right-${selectedExpense?.id}`}
                  title=""
                  fields={[
                    {
                      name: 'recurring',
                      value: selectedExpense?.recurring ? 'true' : 'false',
                      label: 'Despesa Recorrente?',
                      type: 'select',
                      options: [
                        { value: 'false', label: 'Não (Única)' },
                        { value: 'true', label: 'Sim (Mensal)' },
                      ],
                    },
                    { name: 'note', value: selectedExpense?.note || '', label: 'Observações/Notas', type: 'textarea' },
                  ]}
                  showDelete
                  onDelete={() => { setModalEditShow(false); setModalDeleteShow(true); }}
                  onSubmit={handleEditSubmit}
                  submitLabel="Salvar Alterações"
                  loading={loading}
                  onChange={(name, value) => setDraftExpense((prev: any) => ({ ...prev, [name]: value }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnActionBack} onClick={() => { setModalEditShow(false); setSelectedExpense(undefined); }}>
              Voltar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal show={modalDeleteShow} onHide={() => setModalDeleteShow(false)} size="sm" centered className={styles.warningExpenseModal}>
        <Modal.Body className={styles.warningExpenseBody}>
          <div className={styles.warningExpenseIconContainer}>
            <span className={styles.warningExpenseIcon}>⚠</span>
          </div>
          <h5 className={styles.warningExpenseTitle}>Confirmação</h5>
          <p className={styles.warningExpenseMessage}>Deseja realmente excluir esta despesa?</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalWarningFooter}>
          <ButtonCancelar variant="outline" onClick={() => setModalDeleteShow(false)} CancelLabel="Cancelar" />
          <Button variant="danger" onClick={handleDeleteConfirm} className={styles.warningExpenseButton}>Excluir</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}