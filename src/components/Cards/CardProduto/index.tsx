'use client'

import { ReactNode } from "react"
import styles from "./styles.module.css"
import { strict } from "assert"

type Action = {
  label: string
  onClick(): void
}
type CardProductProps = {
  title?: string
  products: Product
  loading?: boolean
  actions?: Action[]
}



export default function CardProduto({ title, products, loading = true, actions }: CardProductProps) {
  return (
    
    <div className={styles.container}>
      <h3 className={styles.title}>{title || "Product"}</h3>

      <div className={styles.info}>
        <p><strong>ID:</strong> {products.id}</p>
        <p><strong>Descrição:</strong> {products.description}</p>
        <p><strong>Nome:</strong> {products.name}</p>
        <p><strong>markupPercent:</strong> {products.markupPercent}</p>
        <p><strong>preço:</strong> {products.costPrice}</p>
        <p><strong>Categoria:</strong> {products.category}</p>
        
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