import React from "react";
import styles from "./styles.module.css";
import { TrendUpIcon, ChefHatIcon, DotIcon, ThumbsUpIcon } from "@phosphor-icons/react";

export default function WelcomeLogin() {
  return (
    <>
      {/* === PAINÉIS SUPERIORES === */}
      <div className={styles.topPanels}>
        <div className={styles.miniGlass}>Planeje</div>
        <div className={styles.miniGlass}>Crie</div>
        <div className={styles.miniGlass}>Evolua</div>
      </div>

      {/* === LOGO NO CONTAINER === */}
      <div className={styles.logoContainer}>
        <img src="/imgs/logoWelcome.png" alt="Logo Sant' Sapore" className={styles.logo} />
      </div>

      {/* === ÍCONES DECORATIVOS LATERAL DIREITA === */}
      <div className={styles.iconContainer}>
        <ChefHatIcon size={22} color="#FFEAEF" weight="duotone" />
        <DotIcon size={22} color="#FFEAEF" weight="regular" />
        <TrendUpIcon size={22} color="#FFEAEF" weight="duotone" />
        <DotIcon size={22} color="#FFEAEF" weight="regular" />
        <ThumbsUpIcon size={22} color="#FFEAEF" weight="duotone" />
      </div>

      {/* === ÁREA INFERIOR === */}
      <div className={styles.wrapper}>
        <div className={styles.glassBox}>
          <h1 className={styles.title}>
            Olá <span className={styles.highlight}>Confeiteira!</span>
          </h1>
        </div>

        <div className={styles.glassBox}>
          <p className={styles.description}>
            Gerencie seus pedidos, estoque e clientes de forma simples e
            eficiente. Tudo o que você precisa para evoluir seu negócio, feito com carinho para você.
          </p>
        </div>

        <p className={styles.footer}>
          © 2025 Sant&apos; Sapore. Todos os direitos reservados.
        </p>
      </div>
    </>
  );
}
