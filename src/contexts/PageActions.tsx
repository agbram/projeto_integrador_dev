// PageActions.tsx
"use client";
import { createContext, ReactNode, useCallback, useMemo, useState } from "react";

// TODO: Ajustar para ter apenas setActionBar() e actionBar 

type HandleAddType = () => void;
type HandleFilterType = (showDisabled: boolean) => void;


type PageActionsType = {
  handleAdd: HandleAddType;
  setHandleAdd: (h: HandleAddType) => void;
  handleFilter: HandleFilterType;
  setHandleFilter: (h: HandleFilterType) => void;
};

export const PageActions = createContext<PageActionsType>({} as PageActionsType);

type Props = { children: ReactNode; };

export function PageActionProvider({ children }: Props) {
  const [handleAdd, setHandleAddState] = useState<HandleAddType>(() => () => {});
  const [handleFilter, setHandleFilterState] = useState<HandleFilterType>(() => () => {});

  // wrappers estáveis (evitam o problema de "updater" e dão referência estável)
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
    setHandleFilter
  }), [handleAdd, setHandleAdd, handleFilter, setHandleFilter]);

  return <PageActions.Provider value={value}>{children}</PageActions.Provider>;
}
