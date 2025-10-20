'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './styles.module.css';

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
        router.push('/login');
      }
      setLoading(false);
    }, 1000); // 300ms para parecer natural

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className={styles.load}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}