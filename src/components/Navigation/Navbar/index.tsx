// Navbar.tsx
"use client";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import {
  PackageIcon,
  HouseIcon,
  ClipboardTextIcon,
  UsersIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  InvoiceIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
import HamburgerButton from "@/components/HamburgerButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const isActive = (path: string) => pathname === path;

  // Fecha menu com esc e trava scroll do body quando aberto
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerInner}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
          }}
        >
          <div className={styles.mobileMenu}>
            <HamburgerButton open={open} onClick={() => setOpen((s) => !s)} />
          </div>

          {/* NAV (desktop) */}
          <div className="d-none d-md-block mt-2">
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
      </div>

      {/* SIDE MENU OVERLAY (aparece quando open === true) */}
      <div
        className={`${styles.sideOverlay} ${open ? styles.sideOpen : ""}`}
        role="dialog"
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <nav
          className={styles.sideMenu}
          onClick={(e) => {
            // evita que clique dentro do menu feche o overlay
            e.stopPropagation();
          }}
        >
          <div className={styles.sideHeader}>
            <strong>Menu</strong>
            <button
              aria-label="Fechar menu"
              className={styles.sideClose}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.sideNav}>
            <Link
              href="/"
              className={`${styles.sideNavLink} ${
                isActive("/") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <HouseIcon
                  size={18}
                  weight={isActive("/") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Homepage</span>
            </Link>

            <Link
              href="/produtos"
              className={`${styles.sideNavLink} ${
                isActive("/produtos") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <PackageIcon
                  size={18}
                  weight={isActive("/produtos") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Produtos</span>
            </Link>

            <Link
              href="/estoque"
              className={`${styles.sideNavLink} ${
                isActive("/estoque") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <ClipboardTextIcon
                  size={18}
                  weight={isActive("/estoque") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Estoque</span>
            </Link>

            <Link
              href="/clientes"
              className={`${styles.sideNavLink} ${
                isActive("/clientes") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <UsersIcon
                  size={18}
                  weight={isActive("/clientes") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Clientes</span>
            </Link>

            <Link
              href="/relatorios"
              className={`${styles.sideNavLink} ${
                isActive("/relatorios") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <ChartBarIcon
                  size={18}
                  weight={isActive("/relatorios") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Relatórios</span>
            </Link>

            <Link
              href="/despesas"
              className={`${styles.sideNavLink} ${
                isActive("/despesas") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <InvoiceIcon
                  size={18}
                  weight={isActive("/despesas") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Despesas</span>
            </Link>

            <Link
              href="/pedidos"
              className={`${styles.sideNavLink} ${
                isActive("/pedidos") ? styles.activeLink : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.sideNavIcon} aria-hidden>
                <ShoppingCartIcon
                  size={18}
                  weight={isActive("/pedidos") ? "fill" : "regular"}
                />
              </span>
              <span className={styles.sideNavText}>Pedidos</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
