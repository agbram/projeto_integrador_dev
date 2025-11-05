// ActionBar.tsx
"use client";
import { JSX, useState } from "react";
import { Dropdown, Button } from "react-bootstrap";
import FAB from "@/components/FAB";
import {
  ChartBarIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  StackPlusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import { usePageActions } from "@/hooks/usePageActions";

type Props = {
  onSearch?: (q: string) => void;
  onFilter?: () => void;
  onAdd?: () => void;
  title?: string; // se quiser sobrescrever o título
};

export default function ActionBar({ onSearch, onFilter, onAdd, title }: Props) {
  const [q, setQ] = useState("");
  const rawPath = usePathname();
  const pathname = rawPath ?? "/";

  const pageAction = usePageActions();
  const { handleFilter } = usePageActions();

  function getPageTitle() {
    if (title) return title;
    switch (pathname) {
      case "/":
        return "Homepage";
      case "/produtos":
        return "Produtos";
      case "/estoque":
        return "Estoque";
      case "/clientes":
        return "Clientes";
      case "/relatorios":
        return "Relatórios";
      case "/despesas":
        return "Despesas";
      case "/pedidos":
        return "Pedidos";
      default:
        if (pathname.length > 1)
          return pathname.charAt(1).toUpperCase() + pathname.slice(2);
        return "Página";
    }
  }

  function getPageIconMobile(pathname: string): JSX.Element {
      switch (pathname) {
        case "/produtos": return <PackageIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        case "/estoque": return <StackPlusIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        case "/clientes": return <UserPlusIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        case "/relatorios": return <ChartBarIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        case "/despesas": return <ReceiptIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        case "/pedidos": return <ShoppingCartIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
        default: return <PlusIcon size={24} style={{ marginLeft: 8 }} weight="bold"/>;
      }
  }
  const IconComp = getPageIconMobile(pathname);

  function submitSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    onSearch?.(q);
  }

  return (
    <div className={styles.actionBar}>
      <h2 className={styles.pageTitle}>{getPageTitle()}</h2>

      <div className={styles.actionsRow}>
        <form className={styles.searchBox} onSubmit={submitSearch}>
          <input
            className={styles.searchInput}
            placeholder="Procurar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Procurar"
          />
          <button
            type="submit"
            aria-label="Pesquisar"
            className={styles.iconBtn}
          >
            <MagnifyingGlassIcon size={16} />
          </button>
        </form>

        <Dropdown className={styles.filterDropdown}>
          <Dropdown.Toggle id="dropdown-basic" className={styles.filterBtn}>
            <FunnelSimpleIcon size={16} className="me-2" />
            Filtrar
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleFilter(true)}>Mostrar clientes desativados</Dropdown.Item>
            <Dropdown.Item onClick={() => onFilter?.()}>Opção 2</Dropdown.Item>
            <Dropdown.Item onClick={() => onFilter?.()}>Opção 3</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button
          variant="light"
          className={styles.addBtn}
          onClick={pageAction.handleAdd}
        >
          <PlusIcon size={16} className="me-2" /> Add
        </Button>

        <FAB onClick={() => {}} text={IconComp} />

      </div>
    </div>
  );
}
