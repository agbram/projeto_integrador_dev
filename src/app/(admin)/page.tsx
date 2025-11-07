'Use Client';
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css"
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <>
      <h1 className={styles.dev}>EM DESEVOLVIMENTO...<HourglassMediumIcon size={60} /></h1>
    </>
  );
}