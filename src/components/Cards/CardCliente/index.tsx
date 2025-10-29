'use client'

import Customer from "@/models/Customer"
import styles from "./styles.module.css"
import ButtonDropDown from "@/components/Buttons/ButtonDropdown"
import { useState } from "react"

// Tipos
type Action = {
  label: string
  onClick(): void
}

type CardClienteProps = {
  title?: string
  customer: Customer
  loading?: boolean
  actions?: Action[]
}

export default function CardCliente({ title, customer, loading = false, actions }: CardClienteProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    
    <div className={styles.container}>
      {actions?.map((action, index) => (
            <div
              key={index}
              onClick={action.onClick}
            >
            </div>
          ))}
      <div className={styles.header}>
        <h3 className={styles.title} onClick={() => setShowDetails(true)}>{title || "Cliente"}</h3>
        { showDetails && <ButtonDropDown onClick={() => setShowDetails(!showDetails)} /> }
        
      </div>

        <div className={`${styles.info} ${showDetails ? styles.show : ""}`}>
          <p><strong>ID:</strong> {customer.id}</p>
          <p><strong>Tipo de documento:</strong> {customer.type === "PF_CPF" ? "CPF" : "CNPJ"}</p>
          <p><strong>Documento:</strong> {customer.document}</p>
          <p><strong>Nome:</strong> {customer.name}</p>
          <p><strong>Contato:</strong> {customer.contact}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Endereço:</strong> {customer.address}</p>
          <p><strong>Modalidade:</strong> {customer.modality}</p>

          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={styles.button}
            >
              {action.label}
            </button>
          ))}
        </div>
    </div>
  )
}
