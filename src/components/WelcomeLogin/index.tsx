import React from "react";
import styles from "./styles.module.css";
import { CakeIcon, ChartBarIcon, TrendUpIcon } from "@phosphor-icons/react";

export default function WelcomeLogin() {
  return (
    <div className={styles.WelcomeScreen}>

      {/* Palavras superiores (fixas no topo da tela) */}
      <div className={styles.topWords}>
        <span>Gerencie</span>
        <span>Precifique</span>
        <span>Empreenda</span>
      </div>

      {/* Painel de decoração, opcional */}
      <div className={styles.decorativePanel}></div>

      {/* Painel principal em efeito vidro */}
      <div className={styles.mainPanel}>
        
        {/* Ícones superiores */}
        <div className={styles.welcomeIcon}>
          <CakeIcon size={95} color="#FFEAEF" weight="duotone" />
          <TrendUpIcon size={95} color="#FFEAEF" weight="duotone" />
          <ChartBarIcon size={95} color="#FFEAEF" weight="duotone" />
        </div>

        {/* Título */}
        <h1 className={styles.welcomeTitle}>
          Olá <span className={styles.highlight}>Confeiteira!</span>
        </h1>

        {/* Texto de apresentação */}
        <p className={styles.welcomeText}>
          Gerencie pedidos, organize receitas e acompanhe a produção do seu negócio
          com praticidade e um toque de charme que combina com a sua identidade.
        </p>

        {/* Rodapé */}
        <p className={styles.welcomeFooter}>
          © 2025 Sant&apos; Sapore. Todos os direitos reservados.
        </p>

      </div>
    </div>
  );
}
