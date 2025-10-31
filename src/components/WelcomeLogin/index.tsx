import React from "react";
import styles from "./styles.module.css";
import { CakeIcon, ChartBarIcon, TrendUpIcon } from "@phosphor-icons/react";

export default function WelcomeLogin() {
  return (
    <div className={styles.WelcomeLogin}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeIcon}>
          <CakeIcon
            size={180}
            color="#FFEAEF"
            weight="duotone"
          />
          <TrendUpIcon
            size={180} 
            color="#FFEAEF"
            weight="duotone" 
          />
          <ChartBarIcon 
            size={180}
            color="#FFEAEF"
            weight="duotone"
          />
        </div>

        <h1 className={styles.welcomeTitle}>
          Olá <span className={styles.highlight}>Confeiteira!</span>
        </h1>
        <p className={styles.welcomeText}>
          Gerencie pedidos, organize receitas e acompanhe sua produção de forma simples e elegante — 
          tudo o que sua confeitaria precisa em um só lugar.{" "}
        </p>
      </div>
      <p className={styles.welcomeFooter}>
        © 2025 Sant{"'"} Sapore . Todos os direitos reservados.
      </p>
    </div>
  );
}