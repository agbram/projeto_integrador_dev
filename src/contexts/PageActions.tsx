// PageActions.tsx
"use client";
import { createContext, ReactNode, useCallback, useMemo, useState } from "react";

type HandleAddType = () => void;
type HandleFilterType = (value: string) => void;

type FilterOption = {
  label: string;
  value: string;
};

type PageActionsType = {
  // Funções dos botões
  handleAdd: HandleAddType;
  setHandleAdd: (h: HandleAddType) => void;
  handleFilter: HandleFilterType;
  setHandleFilter: (h: HandleFilterType) => void;
  showFilterButton: boolean;                    
  setShowFilterButton: (show: boolean) => void; 
  filterOptions: FilterOption[];                
  setFilterOptions: (opts: FilterOption[]) => void; 
  
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
  const [showFilterButton, setShowFilterButton] = useState(false);
  const [filterOptions, setFilterOptionsState] = useState<FilterOption[]>([])

  

  // Wrappers estáveis
  const setHandleAdd = useCallback((fn: HandleAddType) => {
    setHandleAddState(() => fn);
  }, []);

  const setHandleFilter = useCallback((fn: HandleFilterType) => {
    setHandleFilterState(() => fn);
  }, []);

  const setFilterOptions = useCallback((opts: FilterOption[]) => {
  setFilterOptionsState(opts);
}, []);

const value = useMemo(() => ({
    handleAdd,
    setHandleAdd,
    handleFilter,
    setHandleFilter,
    showAddButton,
    setShowAddButton,
    setFilterOptions,
   setShowFilterButton,
   showFilterButton,   
   filterOptions,       
}), [handleAdd, handleFilter, showAddButton, showFilterButton, filterOptions]);

  return <PageActions.Provider value={value}>{children}</PageActions.Provider>;
}