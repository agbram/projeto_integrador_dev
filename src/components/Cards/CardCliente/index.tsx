'use client'

import Customer from "@/models/Customer"
import styles from "./styles.module.css"
import { useState } from "react"
import { CaretDown, User, IdentificationCard, Phone, Envelope, MapPin, Buildings, IdentificationCardIcon, CaretDownIcon, EnvelopeIcon, MapPinIcon, BuildingsIcon, UserIcon, PhoneIcon } from "@phosphor-icons/react"

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

// Função para formatar CPF/CNPJ
const formatDocument = (type: string, document: string): string => {
  const cleanDoc = document.replace(/\D/g, '')
  
  if (type === "PF_CPF") {
    // Formata CPF: 000.000.000-00
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    // Formata CNPJ: 00.000.000/0000-00
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

// Função para formatar telefone
const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 11) {
    // Formata celular: (00) 00000-0000
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    // Formata telefone fixo: (00) 0000-0000
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    // Retorna o original se não conseguir formatar
    return phone
  }
}

export default function CardCliente({ title, customer, loading = false, actions }: CardClienteProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setShowDetails(!showDetails)}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            <UserIcon size={24} weight="fill" />
          </div>
          <div className={styles.mainInfo}>
            <h3 className={styles.title}>{title || "Cliente"}</h3>
            <div className={styles.basicInfo}>
              <span className={styles.infoItem}>
                <IdentificationCardIcon size={16} />
                {formatDocument(customer.type, customer.document)}
              </span>
              <span className={styles.infoItem}>
                <PhoneIcon size={16} />
                {formatPhone(customer.contact)}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <CaretDownIcon
            size={20} 
            className={`${styles.expandIcon} ${showDetails ? styles.expanded : ''}`} 
          />
        </div>
      </div>

      <div className={`${styles.details} ${showDetails ? styles.show : ''}`}>
        <div className={styles.divider}></div>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <IdentificationCardIcon size={18} className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Tipo de Documento</span>
              <span>{customer.type === "PF_CPF" ? "CPF" : "CNPJ"}</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <EnvelopeIcon size={18} className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Email</span>
              <span>{customer.email}</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <MapPinIcon size={18} className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Endereço</span>
              <span>{customer.address}</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <BuildingsIcon size={18} className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Modalidade</span>
              <span>{customer.modality}</span>
            </div>
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className={`${styles.button} ${action.label.toLowerCase().includes('editar') ? styles.editButton : ''}`}
              >
                {action.label}
                {action.label.toLowerCase().includes('editar') && (
                  <div className={styles.buttonHoverEffect}></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}