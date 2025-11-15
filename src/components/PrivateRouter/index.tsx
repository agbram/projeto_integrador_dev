"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { HeartStraightIcon } from "@phosphor-icons/react";
import { Ring } from "ldrs/react";
import { Image } from "react-bootstrap";
import styles from "./styles.module.css";
import "ldrs/react/Ring.css";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [phrase, setPhrase] = useState("");

  const getRandomPhrase = () => {
    const phrases = [
      "Preparando a confeitaria...",
      "Misturando amor e açúcar...",
      "Decorando com carinho...",
      "Aquecendo o forno digital...",
      "Espalhando confeitos mágicos...",
      "Batendo o chantilly perfeito...",
      "Carregando doçuras e sorrisos...",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  useEffect(() => {
    setPhrase(getRandomPhrase());
  }, []);

  // Redireciona quando terminar o loading e NÃO estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Se está carregando, mostra o loader
  if (isLoading) {
    return (
      <div
        className={styles.wrapper}
        role="status"
        aria-live="polite"
        aria-label="Carregando"
      >
        <HeartStraightIcon className={styles.heartTop} weight="fill" />
        <HeartStraightIcon className={styles.heartBottom} weight="fill" />

        <div className={styles.circlesLeft}>
          <span className={styles.circle} data-idx="1" />
          <span className={styles.circle} data-idx="2" />
          <span className={styles.circle} data-idx="3" />
          <span className={styles.circle} data-idx="4" />
        </div>

        <div className={styles.circlesRight}>
          <span className={styles.circle} data-idx="1" />
          <span className={styles.circle} data-idx="2" />
          <span className={styles.circle} data-idx="3" />
          <span className={styles.circle} data-idx="4" />
        </div>

        <div className={styles.logoSlotTop} aria-hidden="true">
          <Image
            src="/imgs/logosv.png"
            alt="Logo"
            width={300}
            height={150}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div className={styles.logoSlotBottom} aria-hidden="true">
          <Image
            src="/imgs/logomanagersv.png"
            alt="Logo"
            width={300}
            height={150}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div className={styles.centerBox}>
          <div className={styles.square}>
            <Ring
              size="80"
              stroke="10"
              bgOpacity="0"
              speed="2"
              color="#ffb5e2"
            />

            <div className={styles.loadingTextWrapper}>
              <p className={styles.loadingText}>{phrase}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <>{children}</>;

  return null;
}
