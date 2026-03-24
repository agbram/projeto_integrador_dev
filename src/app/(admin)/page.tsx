"use client";

import React, { useContext, useEffect, useState } from "react";
import Card from "@/components/Cards/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import api from "@/services/api";
import { GearIcon, PlayIcon, CheckCircleIcon } from "@phosphor-icons/react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import ButtonCancelar from "@/components/Buttons/ButtonCancel";
import { PageActions } from "@/contexts/PageActions";
import toast from "react-hot-toast"; // <-- importação do toast

// Tipos para as tarefas de produção
interface ProductionTask {
  id: number;
  productId: number;
  totalQuantity: number;
  pendingQuantity: number;
  completedQuantity: number;
  status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  product: {
    id: number;
    name: string;
    description?: string;
    category?: string;
  };
}

interface DashboardSummary {
  totalTasks: number;
  totalPendingUnits: number;
  totalCompletedUnits: number;
  byPriority: {
    URGENT: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  byStatus: {
    PENDING: number;
    IN_PRODUCTION: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    priority: string;
  }>;
}

export default function ProductionPage() {
  const [modalShow, setModalShow] = useState(false);
  const [modalDetailShow, setModalDetailShow] = useState(false);
  // Estados de feedback removidos: successModalShow, warningModalShow, successMessage, warningMessage
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [confirmFullSyncModalShow, setConfirmFullSyncModalShow] = useState(false);
  const pageActions = useContext(PageActions);

  useEffect(() => {
    pageActions.setShowAddButton(false);
  }, []);

  const fetchProductionDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/task/dashboard");
      console.log(" Dashboard response:", response.data);
      setTasks(response.data.tasks || []);
      setDashboardSummary(response.data.summary);
    } catch (error) {
      console.error(" Erro ao buscar tarefas de produção:", error);
      toast.error("Erro ao carregar as tarefas de produção.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionDashboard();
  }, []);

  const handleForceRefresh = () => {
    fetchProductionDashboard();
    toast.success("Lista de produção atualizada!");
  };

  const handleSmartSync = async () => {
    try {
      setSyncLoading(true);
      
      const statusResponse = await api.get("/task/sync-status");
      const { unsyncedOrders } = statusResponse.data.syncStatus;
      
      if (unsyncedOrders === 0) {
        toast.success("Todos os pedidos já estão sincronizados!");
        return;
      }

      const response = await api.post("/task/sync-new-orders");
      
      toast.success(
        `${response.data.summary.successCount} novos pedidos sincronizados! Produção atual preservada.`
      );
      
      fetchProductionDashboard();
      
    } catch (error: any) {
      console.error("Erro na sincronização inteligente:", error);
      toast.error(
        error.response?.data?.message || "Erro ao sincronizar pedidos. Tente novamente."
      );
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFullSync = () => {
    setConfirmFullSyncModalShow(true);
  };

  const confirmFullSync = async () => {
    setConfirmFullSyncModalShow(false); 
    
    try {
      setSyncLoading(true);
      const response = await api.post("/task/sync-all-orders-clean");
      
      toast.success("Sincronização completa realizada. Todos os pedidos foram reprocessados.");
      
      fetchProductionDashboard();
      
    } catch (error: any) {
      console.error("Erro na sincronização completa:", error);
      toast.error("Erro na sincronização completa. Tente novamente.");
    } finally {
      setSyncLoading(false);
    }
  };

  const cancelFullSync = () => {
    setConfirmFullSyncModalShow(false);
  };

  const handleStartProduction = async (taskId: number) => {
    try {
      setProgressLoading(true);
      await api.patch(`/task/${taskId}/status`, { status: "IN_PRODUCTION" });
      toast.success("Produção iniciada com sucesso!");
      fetchProductionDashboard();
    } catch (error: any) {
      console.error("Erro ao iniciar produção:", error);
      toast.error(
        error.response?.data?.error || "Erro ao iniciar produção. Tente novamente."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  const handleUpdateProgress = async (formData: any) => {
    if (!selectedTask) return;
    
    try {
      setProgressLoading(true);
      const completedQuantity = Number(formData.completedQuantity);
      
      if (isNaN(completedQuantity) || completedQuantity <= 0) {
        toast.error("Digite uma quantidade válida maior que zero.");
        return;
      }

      if (completedQuantity > selectedTask.pendingQuantity) {
        toast.error(`Quantidade excede o pendente (${selectedTask.pendingQuantity} unidades)`);
        return;
      }

      await api.patch(`/task/${selectedTask.id}/progress`, { 
        completedQuantity 
      });
      
      toast.success("Progresso atualizado com sucesso!");
      fetchProductionDashboard();
      setModalDetailShow(false);
      setSelectedTask(null);
    } catch (error: any) {
      console.error("Erro ao atualizar progresso:", error);
      toast.error(
        error.response?.data?.error || "Erro ao atualizar progresso. Tente novamente."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      setProgressLoading(true);
      await api.patch(`/task/${taskId}/status`, { status: "COMPLETED" });
      toast.success("Tarefa marcada como concluída!");
      fetchProductionDashboard();
    } catch (error: any) {
      console.error("Erro ao concluir tarefa:", error);
      toast.error("Erro ao concluir tarefa. Tente novamente.");
    } finally {
      setProgressLoading(false);
    }
  };

  const formatPriority = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'URGENT': 'Urgente',
      'HIGH': 'Alta',
      'MEDIUM': 'Média',
      'LOW': 'Baixa'
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'URGENT': '#ff4444',
      'HIGH': '#ff8800',
      'MEDIUM': '#ffbb33',
      'LOW': '#00C851'
    };
    return colors[priority] || '#cccccc';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#6c757d',
      'IN_PRODUCTION': '#007bff',
      'COMPLETED': '#28a745',
      'CANCELLED': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const calculateProgress = (task: ProductionTask) => {
    if (task.totalQuantity === 0) return 0;
    return (task.completedQuantity / task.totalQuantity) * 100;
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'IN_PRODUCTION': 'Em Produção',
      'COMPLETED': 'Concluída',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  return (
    <div className={styles.container}>
      {dashboardSummary && (
        <div className={styles.summaryContainer}>
          <div className={styles.summaryCard}>
            <h3>Total de Tarefas</h3>
            <span className={styles.summaryNumber}>{dashboardSummary.totalTasks}</span>
          </div>
          <div className={styles.summaryCard}>
            <h3>Unidades Pendentes</h3>
            <span className={styles.summaryNumber}>{dashboardSummary.totalPendingUnits}</span>
          </div>
          <div className={styles.summaryCard}>
            <h3>Urgentes</h3>
            <span 
              className={styles.summaryNumber}
              style={{ color: '#ff4444' }}
            >
              {dashboardSummary.byPriority.URGENT}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <h3>Em Produção</h3>
            <span className={styles.summaryNumber}>
              {dashboardSummary.byStatus.IN_PRODUCTION}
            </span>
          </div>
        </div>
      )}

      <div className={styles.syncContainer}>
        <div className={styles.syncButtons}>
          <Button
            variant="outline-primary"
            onClick={handleSmartSync}
            disabled={syncLoading}
            className={styles.smartSyncButton}
          >
            <GearIcon size={20} className={syncLoading ? styles.spinning : ''} />
            {syncLoading ? (
              <>
                <div className={styles.spinner}></div>
                Sincronizando...
              </>
            ) : (
              "Sincronizar Novos Pedidos"
            )}
          </Button>

          <Button
            variant="outline-info"
            onClick={handleForceRefresh}
            disabled={loading}
            className={styles.refreshButton}
          >
            🔄 Atualizar Lista
          </Button>
          
          <Button
            variant="outline-secondary"
            onClick={handleFullSync}
            disabled={syncLoading}
            className={styles.fullSyncButton}
            title="Sincronização completa (reseta toda a produção)"
          >
            <GearIcon size={16} />
            Sync Completo
          </Button>
        </div>
        
        <div className={styles.syncStatus}>
          <small>
            <strong>Dica:</strong> Use "Sincronizar Novos Pedidos" para adicionar pedidos sem perder o progresso atual.
          </small>
        </div>
      </div>

      <div className={styles.containerPrincipal}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Carregando tarefas de produção...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="emptyStateStandard">
            <GearIcon size={48} />
            <h3>Nenhuma tarefa de produção encontrada</h3>
            <p>Clique em "Sincronizar Pedidos" para gerar tarefas a partir dos pedidos.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskCardContainer}>
              <div 
                className={styles.taskCard}
                style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}
              >
                <div className={styles.taskHeader}>
                  <h3 className={styles.taskTitle}>{task.product.name}</h3>
                  <div className={styles.statusBadges}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {formatStatus(task.status)}
                    </span>
                    <span 
                      className={styles.priorityBadge}
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {formatPriority(task.priority)}
                    </span>
                  </div>
                </div>
                
                {task.product.description && (
                  <p className={styles.productDescription}>{task.product.description}</p>
                )}
                
                <div className={styles.taskInfo}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <strong>Total:</strong> {task.totalQuantity}
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Pendente:</strong> {task.pendingQuantity}
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Concluído:</strong> {task.completedQuantity}
                    </div>
                    {task.dueDate && (
                      <div className={styles.infoItem}>
                        <strong>Prazo:</strong> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${calculateProgress(task)}%`,
                        backgroundColor: getPriorityColor(task.priority)
                      }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {Math.round(calculateProgress(task))}%
                  </span>
                </div>

                <div className={styles.taskActions}>
                  {task.status === 'PENDING' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStartProduction(task.id)}
                      disabled={progressLoading}
                      className={styles.actionButton}
                    >
                      <PlayIcon size={16} />
                      Iniciar
                    </Button>
                  )}
                  
                  {task.status === 'IN_PRODUCTION' && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setModalDetailShow(true);
                      }}
                      className={styles.actionButton}
                    >
                      <CheckCircleIcon size={16} />
                      Atualizar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setModalDetailShow(true);
                    }}
                    className={styles.actionButton}
                  >
                    Detalhes
                  </Button>

                  {task.status === 'IN_PRODUCTION' && task.pendingQuantity === 0 && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={progressLoading}
                      className={styles.actionButton}
                    >
                      <CheckCircleIcon size={16} />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO PARA SYNC COMPLETO */}
      <Modal
        show={confirmFullSyncModalShow}
        onHide={cancelFullSync}
        size="lg"
        centered
        className={styles.productionSyncWarningModal}
      >
        <Modal.Header closeButton className={styles.productionSyncWarningHeader}>
          <Modal.Title className={styles.productionModalTitle}>
            Confirmação de Sincronização Completa
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={styles.productionSyncWarningBody}>
          <div className={styles.warningIconContainer}>
            <span className={styles.warningIcon}>⚠</span>
          </div>
          
          <h5 className={styles.warningHeading}>Atenção!</h5>
          
          <div className={styles.warningContent}>
            <p>
              <strong>Esta ação irá resetar TODA a produção atual.</strong>
            </p>
            
            <div className={styles.warningDetails}>
              <p><strong>O que será afetado:</strong></p>
              <ul>
                <li>Todos os pedidos serão reprocessados</li>
                <li>Progresso atual de produção será perdido</li>
                <li>Tarefas existentes serão recriadas</li>
                <li>Histórico de produção será reiniciado</li>
              </ul>
              
              <p><strong>Recomendado apenas se:</strong></p>
              <ul>
                <li>Houve problemas de sincronização</li>
                <li>Pedidos não estão aparecendo corretamente</li>
                <li>Foi orientado pelo suporte técnico</li>
              </ul>
            </div>
            
            <div className={styles.recommendation}>
              <small>
                <strong>Dica:</strong> Para adicionar novos pedidos sem perder o progresso, 
                use <strong>"Sincronizar Novos Pedidos"</strong>.
              </small>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className={styles.productionSyncWarningFooter}>
          <ButtonCancelar 
            variant="outline" 
            onClick={cancelFullSync} 
            CancelLabel="Cancelar"
          />
          <Button 
            variant="danger" 
            onClick={confirmFullSync}
            disabled={syncLoading}
            className={styles.confirmButton}
          >
            {syncLoading ? (
              <>
                <div className={styles.spinner}></div>
                Processando...
              </>
            ) : (
              "Sim, Resetar Toda a Produção"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE DETALHES DA TAREFA */}
      <Modal
        show={modalDetailShow}
        onHide={() => {
          setModalDetailShow(false);
          setSelectedTask(null);
        }}
        size="lg"
        centered
        className={styles.productionModal}
      >
        <Modal.Header closeButton className={styles.productionModalHeader}>
          <Modal.Title className={styles.productionModalTitle}>
            {selectedTask ? `Produção - ${selectedTask.product.name}` : 'Detalhes da Tarefa'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.productionModalBody}>
          {selectedTask && (
            <Card
              title=""
              fields={[
                {
                  name: "completedQuantity",
                  label: "Quantidade Concluída",
                  type: "text",
                  placeholder: `Digite a quantidade (máx: ${selectedTask.pendingQuantity})`,
                },
              ]}
              onSubmit={handleUpdateProgress}
              submitLabel={progressLoading ? "Atualizando..." : "Atualizar Progresso"}
              loading={progressLoading}
              showCancel
              onCancel={() => {
                setModalDetailShow(false);
                setSelectedTask(null);
              }}
              additionalInfo={
                <div className={styles.taskDetails}>
                  <h5>Informações da Tarefa</h5>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <strong>Produto:</strong> {selectedTask.product.name}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Quantidade Total:</strong> {selectedTask.totalQuantity}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Pendente:</strong> {selectedTask.pendingQuantity}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Concluído:</strong> {selectedTask.completedQuantity}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Status:</strong> 
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(selectedTask.status) }}
                      >
                        {formatStatus(selectedTask.status)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Prioridade:</strong> 
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                      >
                        {formatPriority(selectedTask.priority)}
                      </span>
                    </div>
                    {selectedTask.dueDate && (
                      <div className={styles.detailItem}>
                        <strong>Prazo de Entrega:</strong> 
                        {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  {/* Barra de Progresso no Modal */}
                  <div className={styles.progressContainer}>
                    <label>Progresso Geral</label>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${calculateProgress(selectedTask)}%`,
                          backgroundColor: getPriorityColor(selectedTask.priority)
                        }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {selectedTask.completedQuantity} / {selectedTask.totalQuantity} 
                      ({Math.round(calculateProgress(selectedTask))}%)
                    </span>
                  </div>
                </div>
              }
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modais de sucesso e aviso foram removidos */}
    </div>
  );
}