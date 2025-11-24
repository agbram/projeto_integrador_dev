"use client";

import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import TopBar from "../TopBar";
import Navbar from "@/components/Navigation/Navbar";
import ActionBar from "../ActionBar";

export default function Header() {
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const height = el.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <header ref={headerRef} className={styles.headerWrapper}>
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
