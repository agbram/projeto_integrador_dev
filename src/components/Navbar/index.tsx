"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import { Button } from "react-bootstrap";
import { PackageIcon, HouseIcon, ClipboardTextIcon, UsersIcon, ChartBarIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center">
        <Button
          variant="outline-secondary"
          className="d-md-none"
          onClick={() => setOpen(!open)}
        >
          ☰
        </Button>
      </div>

      <div className={`${open ? "d-block" : "d-none"} d-md-block mt-2`}>
        <Nav
          variant="pills"
          activeKey={pathname}
          className="flex-column flex-md-row justify-content-md-center text-center"
        >
          <Nav.Item>
            <Nav.Link as={Link} href="/" eventKey="/">
              <HouseIcon size={20} className={styles.Icon} />Homepage
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} href="/produtos" eventKey="/produtos">
              <PackageIcon size={20} className={styles.Icon} />Produtos
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/estoque" eventKey="/estoque">
              <ClipboardTextIcon size={20} className={styles.Icon} />Estoque
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/clientes" eventKey="/clientes">
              <UsersIcon size={20} className={styles.Icon} />Clientes
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/relatorios" eventKey="/relatorios">
              <ChartBarIcon size={20} className={styles.Icon} />Relatórios
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/pedidos" eventKey="/pedidos">
              <ShoppingCartIcon size={20} className={styles.Icon} />Pedidos
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}
