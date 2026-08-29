import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Toast } from '../hooks/useToast';
import '../styles/toast.css';

interface ToastNotificationProps {
  toasts: Toast[];
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          <ShoppingCart size={18} />
          <span>
            ¡<strong>{toast.productName}</strong> añadido al carrito!
          </span>
        </div>
      ))}
    </div>
  );
};
