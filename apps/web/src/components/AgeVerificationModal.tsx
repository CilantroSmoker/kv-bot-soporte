import { useState } from 'react';
import styles from '../styles/AgeVerificationModal.module.css';
import { apiFetch } from '../services/api';

interface AgeVerificationModalProps {
  onVerified: (dateOfBirth: string) => void;
}

export default function AgeVerificationModal({ onVerified }: AgeVerificationModalProps) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!dateOfBirth) {
      setError('Por favor ingresa tu fecha de nacimiento');
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setError('Debes tener al menos 16 años para acceder a la tienda');
      return;
    }

    setLoading(true);
    try {
      //  Guardar en la BD
      await apiFetch('/users/verify-age', {
        method: 'POST',
        body: JSON.stringify({ dateOfBirth })
      });

      //  Guardar en localStorage también
      localStorage.setItem('userDOB', dateOfBirth);
      localStorage.setItem('ageVerified', 'true');
      
      onVerified(dateOfBirth);
    } catch (err: any) {
      setError(err.message || 'Error al verificar edad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Verificación de Edad</h2>
        <p>Debes tener al menos <strong>16 años</strong> para acceder a la tienda.</p>
        
        <div className={styles.formGroup}>
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => {
              setDateOfBirth(e.target.value);
              setError('');
            }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button onClick={handleVerify} className={styles.verifyBtn} disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar'}
        </button>

        <p className={styles.disclaimer}>
          Tu fecha de nacimiento será guardada de forma segura para cumplir con regulaciones legales.
        </p>
      </div>
    </div>
  );
}
