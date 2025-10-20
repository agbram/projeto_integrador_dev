'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';

type JwtPayload = {
  sub: string;
  name: string;
  email: string;
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
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type Props = {
  children: ReactNode;
}

export function AuthProvider(props: Props) {
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, password: string): Promise<void> {
    return new Promise<void>(function (resolve, reject) {
      api
        .post('/users/login', { email, senha: password })
        .then(function (res) {
          const token = res.data.token;
          localStorage.setItem('token', token);
          const decoded = jwtDecode<JwtPayload>(token);
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
          });
          resolve();
        })
        .catch(function (error) {
          reject(error + ' Credenciais inválidas.');
        });
    });
  }

  function logout(): void {
    localStorage.removeItem('token');
    setUser(null);
    
  }

  useEffect(function restoreSession() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
        });
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {props.children}
    </AuthContext.Provider>
  );
}