import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  productName: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showNotification = useCallback((productName: string) => {
    const id = Date.now().toString();

    setToasts(prev => [...prev, { id, productName }]);

    setTimeout(() => {
      setToasts(prev => 
        prev.filter(t => t.id !== id)
      );
    }, 3000);
  }, []);

  return {
    toasts,
    showNotification,
  };
};
