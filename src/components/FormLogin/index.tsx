import styles from "./styles.module.css";
import React from "react";
import FormTextPassword from "@mui/material/TextField";
import FormTextEmail from "../FormTextEmail";


export default function FormLogin() {
  return (
    <form className={styles.container}>
      <span className={styles.logotipo}>Logotipo</span>
      <h2>Bem-vinda de volta!</h2>

      <FormTextPassword />
      <FormTextEmail />
      
    </form>
  );
}
