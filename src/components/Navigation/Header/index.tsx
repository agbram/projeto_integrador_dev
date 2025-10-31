"use client";

import React from "react";
import styles from "./styles.module.css";
import TopBar from "../TopBar";
import Navbar from "@/components/Navigation/Navbar";
import ActionBar from "../ActionBar";

export default function Header() {
  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerInner}>
        <div className={styles.topBarArea}>
          <TopBar />
        </div>

        <div className={styles.NavBarArea}>
          <Navbar />
        </div>

        <div className={styles.actionBarArea}>
          <ActionBar />
        </div>
      </div>
    </header>
  );
}
