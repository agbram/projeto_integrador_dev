// PageActions.tsx
"use client";
import { createContext, ReactNode, useCallback, useMemo, useState } from "react";

type HandleAddType = () => void;
type HandleFilterType = () => void;

type PageActionsType = {
  // Funções dos botões
  handleAdd: HandleAddType;
  setHandleAdd: (h: HandleAddType) => void;
  handleFilter: HandleFilterType;
  setHandleFilter: (h: HandleFilterType) => void;
  
  // Controle de visibilidade do botão adicionar
  showAddButton: boolean;
  setShowAddButton: (show: boolean) => void;
};

export const PageActions = createContext<PageActionsType>({} as PageActionsType);

type Props = { children: ReactNode; };

export function PageActionProvider({ children }: Props) {
  const [handleAdd, setHandleAddState] = useState<HandleAddType>(() => () => {});
  const [handleFilter, setHandleFilterState] = useState<HandleFilterType>(() => () => {});
  const [showAddButton, setShowAddButton] = useState(true);

  // Wrappers estáveis
  const setHandleAdd = useCallback((fn: HandleAddType) => {
    setHandleAddState(() => fn);
  }, []);

  const setHandleFilter = useCallback((fn: HandleFilterType) => {
    setHandleFilterState(() => fn);
  }, []);

  const value = useMemo(() => ({
    handleAdd,
    setHandleAdd,
    handleFilter,
    setHandleFilter,
    showAddButton,
    setShowAddButton
  }), [handleAdd, handleFilter, showAddButton]);

  return <PageActions.Provider value={value}>{children}</PageActions.Provider>;
}