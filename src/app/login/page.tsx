"use client";
import styles from "./styles.module.css";
import FormLogin from "../../components/FormLogin";
import WelcomeLogin from "@/components/WelcomeLogin";

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.painelBoasVindas}>
        
        <span className={styles.logotipo}></span>
      </div>
      <div className={styles.painelLogin}>
        <WelcomeLogin />
        <FormLogin />
      </div>
    </div>
  );
}
