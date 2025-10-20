'use client'

import styles from "./styles.module.css";
import React, { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Image from "next/image";
import ButtonLogin from "../Buttons/ButtonLogin";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-bootstrap";

export default function FormLogin() {

  return (
    <form className={styles.container}>
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
      
    </form>
  );
}

function FormTextLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sucess, setSucess] = useState<string | null>(null);

  function entrarSucesso(){
    setError(null);
    setSucess('Login realizado com sucesso!');
    
    setTimeout(() => {
      router.push('/');
    }, 1500);
  }

  function entrarFalha(error: string){
    setSucess(null);
    setError("Email ou senha inválidos!");
  }

  function entrar(): void {
    auth
    .login(email, password)
    .then(entrarSucesso)
    .catch(entrarFalha);
  }

  let mensagemAlerta = null;

  if(error){
    mensagemAlerta = (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  } else if(sucess){
    mensagemAlerta = (
      <Alert variant="success">{sucess}</Alert>
    );
  }

 
  return (
    <>
      <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3">
        <Form.Control
          type="email"
          placeholder="name@example.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </FloatingLabel>

      <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
        <Form.Control
          type="password"
          placeholder="Password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
        />
      </FloatingLabel>

      {mensagemAlerta}

      <ButtonLogin 
      onClick={entrar}/>
    </>
  );
}
