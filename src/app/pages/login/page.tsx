"use client";
import Textfield from "@/components/TextField";
import React from "react";
import ButtonLoading from "@/components/Buttons/ButtonLoading";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1>Bem Vindo á</h1>
        
        <Textfield label="Email" type="email" />
        <Textfield label="Password" type="password" />
        <ButtonLoading />
      </div>
    </div>
  );
}
