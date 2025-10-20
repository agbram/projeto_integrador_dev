import React from "react";
import styles from "./styles.module.css";
import { SunIcon, Heart } from "@phosphor-icons/react";

export default function WelcomeLogin() {
  return (
    <div className={styles.WelcomeLogin}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeIcon}>

          <SunIcon size={150} color="#ffe8c2" weight="duotone">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              dur="5s"
              from="0 0 0"
              to="360 0 0"
              repeatCount="indefinite"
            ></animateTransform>
          </SunIcon>

        </div>

        <h1 className={styles.welcomeTitle}>
          Olá{" "}
          <span className={styles.highlight}>
            Confeiteira!
          </span>
        </h1>
        <p className={styles.welcomeText}>
          Organize seus pedidos, controle suas receitas e mantenha tudo em ordem
          com praticidade e estilo. <Heart size={28} color="#ffe8c2" weight="duotone" />
        </p>
      </div>
      <p className={styles.welcomeFooter}>
        © 2025 SweetManager. Todos os direitos reservados.
      </p>
    </div>
  );
}
