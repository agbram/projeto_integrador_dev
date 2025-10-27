"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import { Button, Dropdown } from "react-bootstrap";
import {
  PackageIcon,
  HouseIcon,
  ClipboardTextIcon,
  UsersIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  InvoiceIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const isActive = (path: string) => pathname === path;
  const getPageTitle = () => {
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
        return pathname.charAt(1).toUpperCase() + pathname.slice(2);
    }
  };

  return (
    <header className={styles.headerWrapper}>
      {/* inner container que centraliza todo o conteúdo do header */}
      <div className={styles.headerInner}>
        <div className="p-2" style={{ width: "100%" }}>
          <div className="d-flex justify-content-between align-items-center">
            {/* hamburger para mobile */}
            <Button
              variant="outline-secondary"
              className="d-md-none"
              onClick={() => setOpen(!open)}
            >
              ☰
            </Button>
            {/* título/branding no topo (em telas pequenas o Header.tsx também renderiza título; aqui permanecerá neutro) */}
          </div>

          {/* Nav principal: no mobile o próprio estado 'open' controla se mostra ou não */}
          <div className={`${open ? "d-block" : "d-none"} d-md-block mt-2`}>
            <Nav
              variant="pills"
              activeKey={pathname}
              className={`flex-column flex-md-row justify-content-md-center text-center ${styles.Nav}`}
            >
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/"
                  eventKey="/"
                  className={isActive("/") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <HouseIcon
                      size={18}
                      weight={isActive("/") ? "fill" : "regular"}
                      className={`${isActive("/") ? styles.fufilledIcon : ""}`}
                    />
                  </span>
                  <span className={styles.linkText}>Homepage</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/produtos"
                  eventKey="/produtos"
                  className={isActive("/produtos") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <PackageIcon
                      size={18}
                      weight={isActive("/produtos") ? "fill" : "regular"}
                      className={`${
                        isActive("/produtos") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Produtos</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/estoque"
                  eventKey="/estoque"
                  className={isActive("/estoque") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <ClipboardTextIcon
                      size={18}
                      weight={isActive("/estoque") ? "fill" : "regular"}
                      className={`${
                        isActive("/estoque") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Estoque</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/clientes"
                  eventKey="/clientes"
                  className={isActive("/clientes") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <UsersIcon
                      size={18}
                      weight={isActive("/clientes") ? "fill" : "regular"}
                      className={`${
                        isActive("/clientes") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Clientes</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/relatorios"
                  eventKey="/relatorios"
                  className={isActive("/relatorios") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <ChartBarIcon
                      size={18}
                      weight={isActive("/relatorios") ? "fill" : "regular"}
                      className={`${
                        isActive("/relatorios") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Relatórios</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/despesas"
                  eventKey="/despesas"
                  className={isActive("/despesas") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <InvoiceIcon
                      size={18}
                      weight={isActive("/despesas") ? "fill" : "regular"}
                      className={`${
                        isActive("/despesas") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Despesas</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  as={Link}
                  href="/pedidos"
                  eventKey="/pedidos"
                  className={isActive("/pedidos") ? styles.activeLink : ""}
                >
                  <span className={styles.Icon} aria-hidden>
                    <ShoppingCartIcon
                      size={18}
                      weight={isActive("/pedidos") ? "fill" : "regular"}
                      className={`${
                        isActive("/pedidos") ? styles.fufilledIcon : ""
                      }`}
                    />
                  </span>
                  <span className={styles.linkText}>Pedidos</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </div>

        {/* subbar com título/busca/ações — alinhada à direita do grupo central */}
        <div className={styles.subbar}>
          <h2 className={styles.pageTitle}>{getPageTitle()}</h2>
          <div className={styles.actionsRow}>
            <div className={styles.searchBox}>
              <input className={styles.searchInput} placeholder="Procurar" />
              <MagnifyingGlassIcon size={16} className={styles.searchIcon} />
            </div>
            <Dropdown className={styles.filterDropdown}>
              <Dropdown.Toggle id="dropdown-basic" className={styles.filterBtn}>
                <FunnelSimpleIcon size={16} className="me-2" />
                Filtrar
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button variant="light" className={styles.addBtn}>
              <PlusIcon size={16} className="me-2" /> Add
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
