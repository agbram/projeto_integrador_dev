'use client'

import { useState } from "react"
import styles from "./styles.module.css"

type Field = {
  name: string
  label: string
  type?: string
}

type FormProps = {
  title: string
  fields: Field[]
  onSubmit: (data: Record<string, string>) => void
  submitLabel?: string
}

export default function Card({ title, fields, onSubmit, submitLabel = "Enviar" }: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({})
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map(field => (
          <label key={field.name}>
            {field.label}:
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              required
            />
            <br />
          </label>
        ))}

        <button type="submit" className={styles.button}>
          {submitLabel}
        </button>
      </form>
    </div>
  )
}
