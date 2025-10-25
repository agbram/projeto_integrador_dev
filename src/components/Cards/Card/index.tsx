'use client'

import { useState } from "react"
import styles from "./styles.module.css"
import ButtonCancelar from "@/components/Buttons/ButtonCancel"

type Field = {
  name: string
  label?: string
  type?: string
  value?: string
  options?: { value: string; label: string }[]
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void // Adicione esta linha se quiser onChange individual
}

type FormProps = {
  title?: string
  fields: Field[]
  onSubmit: (data: Record<string, string>) => void
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
  showCancel?: boolean
  onCancel?: () => void
  onChange?: (name: string, value: string) => void
}

export default function Card({ 
  title, 
  fields, 
  onSubmit, 
  submitLabel = "Enviar", 
  loading = false,
  disabled = false,
  showCancel = false,
  onCancel,
  onChange,
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Atualiza o estado interno
    setFormData(prev => ({ ...prev, [name]: value }))

    // Chama o onChange externo se existir
    if (onChange) {
      onChange(name, value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submittedData = { ...formData }
    fields.forEach(field => {
      if (field.value !== undefined) {
        submittedData[field.name] = field.value
      }
    })
    
    onSubmit(submittedData)
  }

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map(field => {
          const value = field.value !== undefined ? field.value : (formData[field.name] || "")
          
          return (
            <label key={field.name}>
              {field.label}:
              {field.type === 'select' && field.options ? (
                <select
                  name={field.name}
                  value={value}
                  onChange={handleChange}
                  required
                  disabled={loading || disabled}
                >
                  <option value="">Selecione uma opção</option>
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={value}
                  onChange={handleChange}
                  required
                  disabled={loading || disabled}
                />
              )}
              <br />
            </label>
          )
        })}

        <div className={styles.buttonsRow}>
          {showCancel && onCancel && (
            <ButtonCancelar
              label="Cancelar"
              onClick={onCancel}
            />
          )}
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || disabled}
          >
            {loading ? "Cadastrando..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}