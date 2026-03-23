import React, { useContext } from "react";
import styles from "./styles.module.css";
import { SignOut } from "@phosphor-icons/react";
import { AuthContext } from "@/contexts/AuthContext";

export default function TopBar() {
  const { user, logout } = useContext(AuthContext);

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

      {/* Área do usuário e logout */}
      <div className={styles.userArea}>
        {user && (
          <span className={styles.userName}>Olá, {user.name.split(' ')[0]}</span>
        )}
        <button className={styles.logoutBtn} onClick={logout} title="Sair">
          <SignOut size={24} weight="bold" />
        </button>
      </div>
    </div>
  );
}
