'use client'

import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-bootstrap";
import styles from "./styles.module.css";
import ButtonLogin from "../Buttons/ButtonLogin"; 

export default function FormLogin() {
  return (
    <div className={styles.container}>
      <span className={styles.logotipo}>
        <Image
          src="/imgs/logo.png"
          alt="logo do trem"
          fill
          style={{ objectFit: "contain" }}
        />
      </span>

      <h2>Bem-vinda de volta!</h2>

      <FormTextLogin />
    </div>
  );
}

function FormTextLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const auth = useAuth();

  function entrarSucesso() {
    setError(null);
    setSuccess("Login realizado com sucesso!");
    setTimeout(() => router.push("/"), 1500);
  }

  function entrarFalha() {
    setSuccess(null);
    setError("Email ou senha inválidos!");
  }

  function entrar() {
    auth.login(email, password).then(entrarSucesso).catch(entrarFalha);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    entrar();
  }

  const mensagemAlerta = error ? (
    <Alert variant="danger">{error}</Alert>
  ) : success ? (
    <Alert variant="success">{success}</Alert>
  ) : null;

  return (
    <>
    <form onSubmit={handleSubmit}>
      <FloatingLabel controlId="floatingInput" label="Email" className="mb-3">
        <Form.Control
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
      </FloatingLabel>

      <FloatingLabel controlId="floatingPassword" label="Senha" className="mb-3">
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />
      </FloatingLabel>

      {mensagemAlerta}

      <ButtonLogin type="submit" />
    </form>
    </>
  );
}
