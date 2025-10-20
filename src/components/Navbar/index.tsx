"use client";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import { Button } from "react-bootstrap";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-2 border-bottom">
      {/* Cabeçalho com botão de menu (aparece só no mobile) */}
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

      {/* Nav responsiva: horizontal em telas grandes, vertical em telas pequenas */}
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
            <Nav.Link href="">Produtos</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/2">Estoque</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/clientes">Clientes</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/4">Relatórios</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/5">Pedidosaa</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="link-1">Option 2</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="disabled" disabled>
              Disabled
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}