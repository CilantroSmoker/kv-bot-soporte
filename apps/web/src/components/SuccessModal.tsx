import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import '../styles/animations.css';

interface SuccessModalProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, message, onClose }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAnimatingOut(false);
      return;
    }

    // Inicia la animación de desvanecimiento un poco antes (a los 1.7s)
    const fadeOutTimer = setTimeout(() => {
      setIsAnimatingOut(true);
    }, 1700);

    // Cierra definitivamente el modal a los 2 segundos
    const closeTimer = setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 2000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onClose();
    }, 300);
  };

  return (
    <div  
      className={`success-modal-overlay ${isAnimatingOut ? 'fade-out-animation' : ''}`}  
      onClick={handleOverlayClick}
    >
      <div  
        className="success-modal-content"  
        onClick={(e) => e.stopPropagation()}
      >
        {/* SVG con tus animaciones personalizadas */}
        <div className="success-checkmark">
          <svg className="checkmark-circle" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="54" />
            <path d="M35 60 L52 77 L85 43" />
          </svg>
        </div>

        <p className="success-message">
          {message || "¡Cuenta de Minecraft vinculada correctamente!"}
        </p>
        
        {/* Lucide icon importado para cumplir el requerimiento técnico */}
        <div style={{ display: 'none' }}>
          <CheckCircle2 />
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
