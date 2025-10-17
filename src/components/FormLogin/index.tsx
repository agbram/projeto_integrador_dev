import styles from "./styles.module.css";
import React from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/Button';
import Image from "next/image";



export default function FormLogin() {
  return (
    <form className={styles.container}>
      <span className={styles.logotipo}><Image src="/imgs/logo.png" alt="logo do trem" fill style={{objectFit:"contain"}} /></span>
      <h2>Bem-vinda de volta!</h2>
      <FormTextLogin />
      <ButtonLogin />
    </form>
  );
}

function FormTextLogin() {
  return (
    <>
      <FloatingLabel
        controlId="floatingInput"
        label="Email address"
        className="mb-3"
      >
        <Form.Control type="email" placeholder="name@example.com" />
      </FloatingLabel>

      <FloatingLabel 
      controlId="floatingPassword" 
      label="Password"
      className="mb-3"
      >
        <Form.Control type="password" placeholder="Password" />
      </FloatingLabel>
    </>
  );
}

function ButtonLogin() {
  return (
    <div className="d-grid gap-2">
      <Button variant="primary" size="lg">
        Entrar
      </Button>
    </div>
  );
}
