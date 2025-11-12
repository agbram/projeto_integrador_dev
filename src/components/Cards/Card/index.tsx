'use client'

import { useState } from "react"
import styles from "./styles.module.css"
import ButtonCancelar from "@/components/Buttons/ButtonCancel"

export type FormData = Record<string, string | File | Date | Number>;

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
  onSubmit: (data: FormData) => void
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
  showCancel?: boolean
  showDelete?: boolean
  onCancel?: () => void
  onDelete?: () => void
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
  showDelete = false,
  onCancel,
  onDelete,
  onChange,
}: FormProps) {
  const [formData, setFormData] = useState<FormData>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Atualiza o estado interno
    if (e.target instanceof HTMLInputElement && e.target.files) {
      const files = e.target.files;
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Chama o onChange externo se existir
    if (onChange) {
      onChange(name, value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submittedData = { ...formData }
    fields.forEach(field => {
      const fieldNaoFoiAlterado = submittedData[field.name] === undefined;
      if (fieldNaoFoiAlterado && field.value !== undefined) {
        submittedData[field.name] = field.value 
      }
    })
    console.log(submittedData)
    onSubmit(submittedData)
  }

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map(field => {

          const value = formData[field.name] !== undefined ? formData[field.name] : field.value || "";
          
          return (
            <label key={field.name}>
              {field.label}:
              {field.type === 'select' && field.options ? (
                <select
                  name={field.name}
                  value={value.toString()}
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
                  value={field.type === 'file' ? undefined : value.toString()}
                  onChange={handleChange}
                  disabled={loading || disabled}
                />
              )}
              <br />
            </label>
          )
        })}

        <div className={styles.buttonsRow}>
          {showDelete && onDelete && (
            <ButtonCancelar
              label= "Desativar"
              onClick={onDelete}
              variant="outline"
            />
          )}
          {showCancel && onCancel && (
            <ButtonCancelar
              label="Cancelar"
              onClick={onCancel}
              variant="cancelLight"
            />
          )}

          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading || disabled}
          >
            {loading ? "Verificando..." : submitLabel}  
          </button>
        </div>
      </form>
    </div>
  )
}