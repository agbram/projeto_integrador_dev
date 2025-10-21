"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import { Button } from "react-bootstrap";
import { PackageIcon, House, ClipboardText, Users, ChartBar, ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-bold">Menu</h5>
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
              <House size={20} className="me-2" />Homepage
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} href="/produtos" eventKey="/produtos">
              <PackageIcon size={20} className="me-2" />Produtos
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/estoque" eventKey="/estoque">
              <ClipboardText size={20} className="me-2" />Estoque
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/clientes" eventKey="/clientes">
              <Users size={20} className="me-2" />Clientes
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/relatorios" eventKey="/relatorios">
              <ChartBar size={20} className="me-2" />Relatórios
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} href="/pedidos" eventKey="/pedidos">
              <ShoppingCart size={20} className="me-2" />Pedidos
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}
