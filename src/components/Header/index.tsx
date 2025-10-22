"use client";

import Logo from "../Logo";
import Navbar from "../Navbar";
import styles from "./styles.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoArea}>
          <h1 className={styles.title}>SweetManager</h1>
        </div>
        <Navbar />
      </div>
    </header>
  );
}
