import React from "react";
import styles from "./styles.module.css";
import { Image } from "react-bootstrap";
import { HeartIcon } from "@phosphor-icons/react";


export default function TopBar({
  brand = "Sant'Sapore",
  onProfileClick = () => {},
}) {
  return (
    <div className={styles.topbar}>
      <div className={styles.brand}>
        <div className={styles.logoCircle} aria-hidden="true">
         <HeartIcon size={30} color="#FF6B6B" weight="fill" />
       
        </div>
        <span className={styles.brandText}>{brand}</span>
      </div>

      <button
        className={styles.profileBtn}
        onClick={onProfileClick}
        aria-label="Abrir perfil"
      >
        <Image
          className={styles.profileImg}
          src="https://i.pravatar.cc/40"
          alt="perfil"
        />
        
      </button>
    </div>
  );
}
