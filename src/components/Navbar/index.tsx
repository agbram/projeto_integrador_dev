"use client";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import { Button } from "react-bootstrap";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-2">
      {/* Cabeçalho com botão de menu (só no mobile) */}
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

      {/* Nav responsiva */}
      <div className={`${open ? 'd-block' : 'd-none'} d-md-block mt-2`}>
        <Nav
          variant="pills"
          defaultActiveKey="/home"
          className="flex-column flex-md-row justify-content-md-center text-center"
        >
          <Nav.Item>
            <Nav.Link href="/home">Homepage</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/produtos">Produtos</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/2">Estoque</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/3">Clientes</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/4">Relatórios</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/5">Pedidos</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}
