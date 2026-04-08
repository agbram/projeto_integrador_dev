"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/services/api";
import { usePathname } from "next/navigation";

interface NotificationCounts {
  pricing: number;
  production: number;
  orders: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  refreshCounts: () => Promise<void>;
  clearCount: (category: keyof NotificationCounts) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<NotificationCounts>({
    pricing: 0,
    production: 0,
    orders: 0,
  });

  const pathname = usePathname();

  const refreshCounts = useCallback(async () => {
    try {
      // 1. Produtos pendentes de precificação
      const pricingRes = await api.get("/pricing/products/not-calculated");
      const pricingCount = Array.isArray(pricingRes.data) ? pricingRes.data.length : 0;

      // 2. Tarefas de produção pendentes (Dashboard)
      const productionRes = await api.get("/task/dashboard");
      const productionCount = productionRes.data?.summary?.byStatus?.PENDING || 0;

      // 3. Pedidos prontos mas não entregues
      const ordersRes = await api.get("/orders");
      const ordersCount = Array.isArray(ordersRes.data) 
        ? ordersRes.data.filter((o: any) => 
            (o.status === "READY_FOR_DELIVERY" || o.status === "PRODUCTION_COMPLETE") && o.status !== "DELIVERED"
          ).length 
        : 0;

      setCounts({
        pricing: pricingCount,
        production: productionCount,
        orders: ordersCount,
      });
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
    }
  }, []);

  const clearCount = useCallback((category: keyof NotificationCounts) => {
    setCounts(prev => ({ ...prev, [category]: 0 }));
  }, []);

  // Atualiza ao montar
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Limpa notificações ao entrar nas páginas correspondentes
  useEffect(() => {
    if (pathname === "/precificacao") clearCount("pricing");
    if (pathname === "/") clearCount("production");
    if (pathname === "/pedidos") clearCount("orders");
  }, [pathname, clearCount]);

  return (
    <NotificationContext.Provider value={{ counts, refreshCounts, clearCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
