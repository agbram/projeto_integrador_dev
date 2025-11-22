import React from "react";
import styles from "./styles.module.css";

export default function WelcomeLogin() {
  return (
    <>
      {/* === PAINÉIS SUPERIORES === */}
      <div className={styles.topPanels}>
        <div className={styles.miniGlass}>Planeje</div>
        <div className={styles.miniGlass}>Crie</div>
        <div className={styles.miniGlass}>Evolua</div>
      </div>

      {/* === ÁREA INFERIOR (já existente) === */}
      <div className={styles.wrapper}>
        <div className={styles.glassBox}>
          <h1 className={styles.title}>
            Olá <span className={styles.highlight}>Confeiteira!</span>
          </h1>
        </div>

        <div className={styles.glassBox}>
          <p className={styles.description}>
            Gerencie pedidos, organize receitas e acompanhe a produção do seu
            negócio com praticidade e um toque de charme que combina com a sua
            identidade.
          </p>
        </div>

        <p className={styles.footer}>
          © 2025 Sant&apos; Sapore. Todos os direitos reservados.
        </p>
      </div>
    </>
  );
}
