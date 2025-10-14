"use client";
import React from "react";
import ButtonLoading from "@/components/Buttons/ButtonLoading";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles.module.css";
import FormTextEmail from "@/components/TextFieldEmail";
import FormTextPassword from "@/components/TextFieldPassword";

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1>Bem Vindo!</h1>
        
        <FormTextEmail/>
        <FormTextPassword/>
        <ButtonLoading />

      </div>
    </div>
  );
}
