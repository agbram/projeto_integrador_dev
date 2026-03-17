// components/ToastContainer.tsx
import { Toaster } from 'react-hot-toast';

export function ToastContainer() {
  return (
    <Toaster
      position="top-center" // ou "bottom-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '500px',
        },
        success: {
          duration: 3000,
          icon: '✅',
          style: {
            background: '#10b981', // verde vibrante
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          },
        },
        error: {
          duration: 4000,
          icon: '❌',
          style: {
            background: '#ef4444', // vermelho vibrante
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          },
        },
      }}
    />
  );
}