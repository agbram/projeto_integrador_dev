'use client'

import { useState } from "react"
import styles from "./styles.module.css"
import ButtonCancelar from "@/components/Buttons/ButtonCancel"

export type FormData = Record<string, string | File | Date | Number >;

type Field = {
  name: string
  label?: string
  type?: string
  value?: string
  options?: { value: string; label: string }[]
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean 
  disabled?: boolean 
  placeholder?: string
  max?: number | string
  min?: number | string
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
  additionalInfo?: React.ReactNode
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
  additionalInfo
}: FormProps) {
  const [formData, setFormData] = useState<FormData>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    const fieldConfig = fields.find(field => field.name === name);
    if (fieldConfig?.readOnly) {
      return;
    }
    
    if (e.target instanceof HTMLInputElement && e.target.files) {
      const files = e.target.files;
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

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
        <div className={styles.fieldsGrid}>
          {fields.map(field => {
            const value = formData[field.name] !== undefined ? formData[field.name] : field.value || "";
            const isReadOnly = field.readOnly; 
            const isDisabled = loading || disabled || field.disabled; 
            
            return (
              <div key={field.name} className={styles.fieldGroup}>
                {field.label && (
                  <label className={styles.label}>
                    {field.label}
                  </label>
                )}
                {field.type === 'select' && field.options ? (
                  <select
                    name={field.name}
                    value={value.toString()}
                    onChange={handleChange}
                    required
                    disabled={isDisabled || isReadOnly}
                    className={styles.select}
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
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    placeholder={field.placeholder}
                    max={field.max}
                    min={field.min}
                    className={`${styles.input} ${isReadOnly ? styles.readOnlyInput : ''}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {additionalInfo && (
          <div className={styles.additionalInfo}>
            {additionalInfo}
          </div>
        )}

        <div className={styles.buttonsRow}>
          {showDelete && onDelete && (
            <ButtonCancelar
              CancelLabel="Desativar"
              onClick={onDelete}
              variant="outline"
            />
          )}
          {showCancel && onCancel && (
            <ButtonCancelar
              CancelLabel="Cancelar"
              onClick={onCancel}
              variant="cancelLight"
            />
          )}
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading || disabled}
          >
            {loading ? "Verificando..." : submitLabel}  
          </button>
        </div>
      </form>
    </div>
  )
}