"use client";

import Card from "@/components/Card";

export default function Clientes() {
  return (
    <Card
  title="Cadastrar Cliente"
  fields={[
    { name: "name", label: "Nome" },
    { name: "cnpj", label: "CNPJ" },
    { name: "contact", label: "Contato" },
    { name: "email", label: "E-mail", type: "email" },
    { name: "address", label: "Endereço" },
    { name: "modality", label: "Modalidade do Cliente" },
  ]}
  onSubmit={(data) => {
    console.log("Cliente cadastrado:", data)
    alert("Cliente cadastrado com sucesso!")
  }}
  submitLabel="Salvar Cliente"
/>
  );
}