"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import api from "@/services/api";

type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  exp?: number; // expiração do token (em segundos)
};

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- LOGIN ---
  async function login(email: string, password: string): Promise<void> {
    try {
const res = await api.post('/users/login', {
  email,
  senha: password,
});

      const token = res.data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode<JwtPayload>(token);

      // Verifica expiração
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem("token");
        setUser(null);
        throw new Error("Token expirado. Faça login novamente.");
      }

      setUser({
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
      });
    } catch (error) {
      throw new Error("Credenciais inválidas ou token expirado.");
    }
  }

  // --- LOGOUT ---
  function logout(): void {
    localStorage.removeItem("token");
    setUser(null);
  }

  // --- RESTAURAÇÃO DE SESSÃO ---
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // Verifica expiração
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.warn("Token expirado — removendo do localStorage.");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
          });
        }
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  // --- DETECTA REMOÇÃO DO TOKEN (outra aba e mesma aba) ---
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" && !event.newValue) {
        // Token removido em outra aba
        setUser(null);
      }
    };

    const handleVisibilityChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Token removido manualmente na mesma aba
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
