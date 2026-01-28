"use client";

import FormLogin from "@/components/FormLogin";
import styles from "./styles.module.css";
import WelcomeLogin from "@/components/WelcomeLogin";

export default function Page() {
  return (
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL),
    <div className={styles.container}>
      <div className={styles.painelBoasVindas}>
        <WelcomeLogin />
        <span className={styles.logotipo}></span>
      </div>
      <div className={styles.painelLogin}>
        <FormLogin />
      </div>
    </div>
  );
}
