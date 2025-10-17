"use client";
import styles from "./styles.module.css";
import FormLogin from "../../../components/FormLogin";

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.painelBoasVindas}>
        olá
        <span className={styles.logotipo}>Logotipo</span>
      </div>
      <div className={styles.painelLogin}>
        <FormLogin />
      </div>
    </div>
  );
}
