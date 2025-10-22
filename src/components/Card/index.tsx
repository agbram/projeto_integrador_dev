'use client'

import { useState } from "react"
import styles from "./styles.module.css"

type Field = {
  name: string
  label: string
  type?: string
  options?: { value: string; label: string }[] // Adicione esta linha
}

type FormProps = {
  title?: string
  fields: Field[]
  onSubmit: (data: Record<string, string>) => void
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
}

export default function Card({ 
  title, 
  fields, 
  onSubmit, 
  submitLabel = "Enviar", 
  loading = false,
  disabled = false 
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map(field => (
          <label key={field.name}>
            {field.label}:
            {field.type === 'select' && field.options ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
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
                value={formData[field.name] || ""}
                onChange={handleChange}
                required
                disabled={loading || disabled}
              />
            )}
            <br />
          </label>
        ))}

        <button 
          type="submit" 
          className={styles.button}
          disabled={loading || disabled}
        >
          {loading ? "Cadastrando..." : submitLabel}
        </button>
      </form>
    </div>
  )
}