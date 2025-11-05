"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "ldrs/react/Helix.css";
import RotatingText from "../Animations/rotatingText";

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

        <RotatingText
          texts={["React", "Bits", "Is", "Cool!"]}
          mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          staggerFrom={"last"}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />

    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // <Helix size="150" speed="2.5" color="black" />
  // Quase lá...
  return <>{children}</>;
}
