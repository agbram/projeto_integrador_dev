'use client'

import styles from "./styles.module.css"

type Customer = {
  id?: number
  name: string
  cnpj: string
  contact: string
  email: string
  address: string
  modality: string
}
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
  return (
    
    <div className={styles.container}>
      <h3 className={styles.title}>{title || "Cliente"}</h3>

      <div className={styles.info}>
        <p><strong>ID:</strong> {customer.id}</p>
        <p><strong>CNPJ:</strong> {customer.cnpj}</p>
        <p><strong>Nome:</strong> {customer.name}</p>
        <p><strong>Contato:</strong> {customer.contact}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Endereço:</strong> {customer.address}</p>
        <p><strong>Modalidade:</strong> {customer.modality}</p>
        
        <div>
          {actions?.map((action, index)=>
              <button key={index} onClick={action.onClick}>
                {action.label}
              </button>
            )}
        </div>
      </div>
    </div>
    
  )
}
