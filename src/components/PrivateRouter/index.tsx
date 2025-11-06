"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DotWave, } from "ldrs/react";
import styles from "./styles.module.css";
import "ldrs/react/DotWave.css";


type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // aguarda um pequeno tempo para verificar token/restaurar sessão
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      }
      setLoading(false);
    }, 1000); // 300ms para parecer natural

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className={styles.load}>
        <DotWave size="100" speed="1" color="black" />
        Quase lá...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
