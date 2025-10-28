import styles from "./styles.module.css"

type CancelProps = {
  label?: string
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "danger"
}

export default function ButtonCancelar({
  label = "Cancelar",
  onClick,
  disabled = false,
  variant = "default"
}: CancelProps) {
  const variantClass =
    variant === "outline"
      ? styles.cancelOutline
      : variant === "danger"
      ? styles.cancelDanger
      : styles.cancelDefault

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
