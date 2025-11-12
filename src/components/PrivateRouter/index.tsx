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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
    const timer = setTimeout(() => {
      if (!isAuthenticated) router.push("/login");
      setLoading(false);
    }, 1500000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div
        className={styles.wrapper}
        role="status"
        aria-live="polite"
        aria-label="Carregando"
      >
        {/* top-left heart (in front of square) */}
        <HeartStraightIcon className={styles.heartTop} weight="fill" />
        {/* bottom-right heart (behind square) */}
        <HeartStraightIcon className={styles.heartBottom} weight="fill" />

        {/* left vertical circles (4) */}
        <div className={styles.circlesLeft}>
          <span className={styles.circle} data-idx="1" />
          <span className={styles.circle} data-idx="2" />
          <span className={styles.circle} data-idx="3" />
          <span className={styles.circle} data-idx="4" />
        </div>

        {/* right vertical circles (3) */}
        <div className={styles.circlesRight}>
          <span className={styles.circle} data-idx="1" />
          <span className={styles.circle} data-idx="2" />
          <span className={styles.circle} data-idx="3" />
          <span className={styles.circle} data-idx="4" />
        </div>

        {/* invisible logo slots: prepare to receive your logos — replace content with <img src=.../> */}
        <div className={styles.logoSlotTop} aria-hidden="true">
          <Image
            src="/imgs/logosv.png"
            alt="Logo"
            width={300} // tamanho base, pode ser qualquer número
            height={150} // só precisa manter proporção parecida
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
            width={300} // tamanho base, pode ser qualquer número
            height={150} // só precisa manter proporção parecida
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* center translucent glass square */}
        <div className={styles.centerBox}>
          <div className={styles.square}>
            {/* {lOADING} */}
            <Ring
              size="80"
              stroke="10"
              bgOpacity="0"
              speed="2"
              color="black"
            />

            <div className={styles.loadingPlaceholder} aria-hidden="true">
              {/* Exemplo: seu loader (substitua) */}
              {/* <YourLoaderComponent /> */}
            </div>

            <div className={styles.loadingTextWrapper}>
              <p className={styles.loadingText}>{phrase}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
