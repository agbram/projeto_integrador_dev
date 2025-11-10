"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DotWave } from "ldrs/react";
import {
  HeartStraight,
  StarFour,
  Flower,
  Sparkle,
} from "@phosphor-icons/react";
import styles from "./styles.module.css";
import "ldrs/react/DotWave.css";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phrase, setPhrase] = useState("");

  // 🎲 Função simples que retorna uma frase aleatória
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
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  };

  useEffect(() => {
    // Escolhe a frase ao iniciar
    setPhrase(getRandomPhrase());

    // Aguarda autenticação
    const timer = setTimeout(() => {
      if (!isAuthenticated) router.push("/login");
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className={styles.background}>
        <HeartStraight
          weight="fill"
          size={48}
          className={`${styles.bgIcon} ${styles.left}`}
        />
        <StarFour
          weight="fill"
          size={52}
          className={`${styles.bgIcon} ${styles.right}`}
        />
        <Flower
          weight="fill"
          size={56}
          className={`${styles.bgIcon} ${styles.top}`}
        />
        <Sparkle
          weight="fill"
          size={42}
          className={`${styles.bgIcon} ${styles.bottom}`}
        />

        <div className={styles.load}>
          <DotWave size="100" speed="1" color="var(--color-primary)" />
          <p className={styles.loadingText}>{phrase}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
