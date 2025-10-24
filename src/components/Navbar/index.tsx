"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import { Button } from "react-bootstrap";
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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-bold"></h5>
        <Button variant="outline-secondary" className="d-md-none" onClick={() => setOpen(!open)}>
          ☰
        </Button>
      </div>

      <div className={`${open ? "d-block" : "d-none"} d-md-block mt-2`}>
        <Nav
          variant="tabs"
          activeKey={pathname}
          className="flex-column flex-md-row justify-content-md-center text-center"
        >
          <Nav.Item>
            <Nav.Link as={Link} href="/" eventKey="/">
              <HouseIcon
                size={20}
                weight={isActive("/") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/") ? styles.fufilledIcon : ""}`}
              />
              
              Homepage
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link as={Link} href="/produtos" eventKey="/produtos">
              <PackageIcon
                size={20}
                weight={isActive("/produtos") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/produtos") ? styles.fufilledIcon : ""}`}
              />
              Produtos
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link as={Link} href="/estoque" eventKey="/estoque">
              <ClipboardTextIcon
                size={20}
                weight={isActive("/estoque") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/estoque") ? styles.fufilledIcon : ""}`}
              />
              Estoque
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link as={Link} href="/clientes" eventKey="/clientes">
              <UsersIcon
                size={20}
                weight={isActive("/clientes") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/clientes") ? styles.fufilledIcon : ""}`}
              />
              Clientes
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link as={Link} href="/relatorios" eventKey="/relatorios">
              <ChartBarIcon
                size={20}
                weight={isActive("/relatorios") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/relatorios") ? styles.fufilledIcon : ""}`}
              />
              Relatórios
            </Nav.Link>

          </Nav.Item>
          <Nav.Link as={Link} href="/despesas" eventKey="/despesas">
                <InvoiceIcon
                  size={20}
                  weight={isActive("/despesas") ? "fill" : "regular"}
                  className={`${styles.Icon} ${isActive("/despesas") ? styles.fufilledIcon : ""}`}
                />
                despesas
              </Nav.Link>
              
          <Nav.Item>
            <Nav.Link as={Link} href="/pedidos" eventKey="/pedidos">
              <ShoppingCartIcon
                size={20}
                weight={isActive("/pedidos") ? "fill" : "regular"}
                className={`${styles.Icon} ${isActive("/pedidos") ? styles.fufilledIcon : ""}`}
              />
              Pedidos
            </Nav.Link>
          </Nav.Item>   
        </Nav>
      </div>
    </div>
  );
}
