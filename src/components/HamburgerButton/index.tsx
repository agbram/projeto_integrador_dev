// HamburgerButton.tsx
import React from "react";
import styles from "./styles.module.css";

interface Props {
  open: boolean;
  onClick: () => void;
}

const HamburgerButton: React.FC<Props> = ({ open, onClick }) => {
  return (
    <div className={styles.hamburgerContainer}>
    <button
      className={`${styles.hamburgerButton} ${open ? styles.open : ""}`}
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      onClick={onClick}
      type="button"
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </button>
    </div>
  );
};

export default HamburgerButton;
