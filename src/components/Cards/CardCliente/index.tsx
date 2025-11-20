'use client'

import Customer from "@/models/Customer"
import styles from "./styles.module.css"
import { useState } from "react"
import { 
  IdentificationCardIcon, 
  CaretDownIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  BuildingsIcon, 
  UserIcon, 
  PhoneIcon,
  ShoppingCartIcon,
  FireIcon 
} from "@phosphor-icons/react"

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

const getOrderCountColor = (ordersCount: number): string => {
  if (ordersCount === 0) return '#e3f2fd'; // Azul muito claro
  if (ordersCount <= 5) return '#bbdefb';  // Azul claro
  if (ordersCount <= 10) return '#64b5f6'; // Azul médio
  if (ordersCount <= 20) return '#4fc3f7'; // Azul esverdeado
  if (ordersCount <= 30) return '#4db6ac'; // Verde água
  if (ordersCount <= 40) return '#81c784'; // Verde
  if (ordersCount <= 50) return '#aed581'; // Verde amarelado
  if (ordersCount <= 60) return '#fff176'; // Amarelo claro
  if (ordersCount <= 70) return '#ffd54f'; // Amarelo
  if (ordersCount <= 80) return '#ffb74d'; // Laranja claro
  if (ordersCount <= 90) return '#ff8a65'; // Laranja
  if (ordersCount <= 100) return '#ff5252'; // Vermelho
  return '#d32f2f'; // Vermelho escuro (100+)
};

const getTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const isHotCustomer = (ordersCount: number): boolean => {
  return ordersCount > 50;
};

const formatDocument = (type: string, document: string): string => {
  const cleanDoc = document.replace(/\D/g, '')
  if (type === "PF_CPF") {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
}

const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return phone
  }
}

export default function CardCliente({ title, customer, loading = false, actions }: CardClienteProps) {
  const [showDetails, setShowDetails] = useState(false)
  const ordersCount = customer.ordersCount || 0
  
  const backgroundColor = getOrderCountColor(ordersCount)
  const textColor = getTextColor(backgroundColor)
  const isHot = isHotCustomer(ordersCount)

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setShowDetails(!showDetails)}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            <UserIcon size={24} weight="fill" />
            {isHot && (
              <div className={styles.fireBadge}>
                <FireIcon size={12} weight="fill" />
              </div>
            )}
          </div>
          <div className={styles.mainInfo}>
            <h3 className={styles.title}>{customer.name}</h3>
            <div className={styles.basicInfo}>
              <span className={styles.infoItem}>
                <IdentificationCardIcon size={16} />
                {formatDocument(customer.type, customer.document)}
              </span>
              <span className={styles.infoItem}>
                <PhoneIcon size={16} />
                {formatPhone(customer.contact)}
              </span>
              <span 
                className={`${styles.infoItem} ${styles.ordersCount}`}
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                  border: isHot ? '2px solid #ff6b35' : 'none'
                }}
              >
                <ShoppingCartIcon size={16} />
                {isHot && <FireIcon size={12} style={{ marginRight: '2px' }} />}
                {ordersCount} pedido{ordersCount !== 1 ? 's' : ''}
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

          <div className={styles.detailItem}>
            <ShoppingCartIcon size={18} className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Nível de Atividade</span>
              <div className={styles.thermometer}>
                <div 
                  className={styles.thermometerFill}
                  style={{ 
                    width: `${Math.min(ordersCount, 100)}%`,
                    backgroundColor: backgroundColor
                  }}
                ></div>
                <span 
                  className={styles.ordersCountText}
                  style={{ color: backgroundColor }}
                >
                  {ordersCount} pedido{ordersCount !== 1 ? 's' : ''}
                  {isHot && ' 🔥'}
                </span>
              </div>
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