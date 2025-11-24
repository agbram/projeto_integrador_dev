import React from "react";
import styles from "./styles.module.css";
import { Image } from "react-bootstrap";
import { HeartIcon } from "@phosphor-icons/react";

export default function TopBar({
  logoSrc = "/logo.png",      // ajuste como quiser
  onProfileClick = () => { },
}) {
  return (
    <div className={styles.topbar}>
      {/* Área da logo */}
      <div className={styles.logoArea}>
        <img
          src="/imgs/logoTopbar.png"
          alt="Logo"
          className={styles.logoImg}
        />
      </div>
    </div>
  );
}
