'use client'

import { useState, useEffect } from "react"
import styles from "./styles.module.css"
import ButtonCancelar from "@/components/Buttons/ButtonCancel"

// Atualize o tipo FormData para aceitar number (primitivo)
export type FormData = Record<string, string | File | Date | number | null | undefined>;

type Field = {
  name: string
  label?: string
  type?: string
  value?: string | number | null
  options?: { value: string; label: string }[]
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  readOnly?: boolean 
  disabled?: boolean 
  placeholder?: string
  max?: number | string
  min?: number | string
  condition?: (data: any) => boolean;
  step?: string
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
  defaultValues?: FormData
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
  additionalInfo,
  defaultValues = {}
}: FormProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    const initialData: FormData = {};
    fields.forEach(field => {
      if (field.value !== undefined && field.value !== null) {
        initialData[field.name] = field.value;
      }
    });
    return { ...initialData, ...defaultValues };
  });

  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const fieldConfig = fields.find(field => field.name === name);
    if (fieldConfig?.readOnly) {
      return;
    }
    
    let newValue: string | File | number | null | undefined;
    
    if (e.target instanceof HTMLInputElement && e.target.files) {
      const files = e.target.files;
      const file = files[0];
      newValue = file;
    } else if (type === 'number') {
      // Para campos numéricos, converte para número ou null se vazio
      newValue = value === '' ? null : parseFloat(value);
    } else {
      newValue = value;
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (onChange) {
      onChange(name, value);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredData: FormData = {};
    Object.keys(formData).forEach(key => {
      const field = fields.find(f => f.name === key);
      if (!field || !field.condition || field.condition(formData)) {
        filteredData[key] = formData[key];
      }
    });
    
    fields.forEach(field => {
      if (filteredData[field.name] === undefined && field.value !== undefined) {
        filteredData[field.name] = field.value;
      }
    });
    
    console.log('Dados submetidos:', filteredData);
    onSubmit(filteredData);
  }

  const visibleFields = fields.filter(field => {
    if (!field.condition) return true;
    return field.condition(formData);
  });

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldsGrid}>
          {visibleFields.map(field => {
            const value = formData[field.name] !== undefined 
              ? formData[field.name] 
              : field.value !== undefined 
                ? field.value 
                : "";
            
            const isReadOnly = field.readOnly; 
            const isDisabled = loading || disabled || field.disabled; 
            
            // Para inputs que não são file, precisamos converter para string
            const stringValue = value === null || value === undefined 
              ? "" 
              : typeof value === 'number' 
                ? value.toString() 
                : value instanceof Date 
                  ? value.toISOString().split('T')[0] // Para date inputs
                  : typeof value === 'string'
                    ? value
                    : "";
            
            return (
              <div key={field.name} className={styles.fieldGroup}>
                {field.label && (
                  <label className={styles.label} htmlFor={field.name}>
                    {field.label}
                  </label>
                )}
                {field.type === 'select' && field.options ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={stringValue}
                    onChange={handleChange}
                    required={false}
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
                ) : field.type === 'file' ? (
                  <input
                    id={field.name}
                    type="file"
                    name={field.name}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className={styles.input}
                    accept="image/*"
                  />
                ) : (
                  <input
                    id={field.name}
                    type={field.type || "text"}
                    name={field.name}
                    value={stringValue}
                    onChange={handleChange}
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    placeholder={field.placeholder}
                    max={field.max}
                    min={field.min}
                    step={field.step || (field.type === 'number' ? '0.01' : undefined)}
                    className={`${styles.input} ${isReadOnly ? styles.readOnlyInput : ''}`}
                  />
                )}
              </div>
            );
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
              disabled={loading || disabled}
            />
          )}
          {showCancel && onCancel && (
            <ButtonCancelar
              CancelLabel="Cancelar"
              onClick={onCancel}
              variant="cancelLight"
              disabled={loading}
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
  );
}