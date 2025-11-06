'use client'

import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Toast, ToastContainer, ProgressBar } from "react-bootstrap";
import styles from "./styles.module.css";
import ButtonLogin from "../Buttons/ButtonLogin"; 

export default function FormLogin() {
  return (
    <div className={styles.container}>
      <span className={styles.logotipo}>
        <Image
          src="/imgs/logo.png"
          alt="logo Sant' Sapore"
          fill
          style={{ objectFit: "contain" }}
        />
      </span>

      <FormTextLogin />
    </div>
  );
}

function FormTextLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado do toast (mensagem, cor e visibilidade)
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({
    show: false,
    message: "",
    variant: "success",
  });

  // Estado da barra de progresso
  const [progress, setProgress] = useState(100);
  const duration = 4000; // tempo que o toast fica visível (ms)

  const router = useRouter();
  const auth = useAuth();

  // Atualiza a barra de progresso
  useEffect(() => {
    if (!toast.show) return;

    setProgress(100);
    const interval = 100; // tempo de atualização (ms)
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setToast((t) => ({ ...t, show: false }));
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.show]);

  function entrarSucesso() {
    setToast({ show: true, message: "Login realizado com sucesso!", variant: "success" });
    setTimeout(() => router.push("/"), 1500);
  }

  function entrarFalha() {
    setToast({ show: true, message: "Email ou senha inválidos!", variant: "danger" });
  }

  function entrar() {
    auth.login(email, password).then(entrarSucesso).catch(entrarFalha);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    entrar();
  }

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

        <ButtonLogin type="submit" />
      </form>

      {/* Toast com barra de progresso */}
      <ToastContainer className={`${styles.toastContainer} p-3`}>
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={duration}
          autohide
          className={styles.toastComponent}
        >
          <Toast.Body className={styles.toastBody}>
            {toast.message} 
          </Toast.Body>
        <ProgressBar
          now={progress}
          variant={toast.variant}
          className={styles.progressBar}
        />
        </Toast>
      </ToastContainer>
    </>
  );
}
