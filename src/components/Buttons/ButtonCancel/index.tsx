import styles from "./styles.module.css"

type CancelProps = {
  label?: string
  onClick: () => void
  disabled?: boolean
  variant?: VariantType
}

export default function ButtonCancelar({
  label = "Cancelar",
  onClick,
  disabled = false,
  variant = "default"
}: CancelProps) {

  const variantClasses: Record<VariantType, string> = {
    default: styles.cancelDefault,
    outline: styles.cancelOutline,
    danger: styles.cancelDanger,
    cancelLight: styles.cancelLight,
    delete: styles.cancelDelete
  }

  const variantClass = variantClasses[variant]

  return (
    <button
      type="button"
      className={`${styles.cancelButton} ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
