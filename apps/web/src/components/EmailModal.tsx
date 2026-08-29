import { useState } from "react";
import { apiFetch } from "../services/api";
import styles from "../styles/Modal.module.css";

interface Props {
  currentEmail?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmailModal({
  currentEmail,
  onClose,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState(currentEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setLoading(true);
    setError("");

    try {
      await apiFetch("/shop/link-email", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <h2>Vincular Email</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
        />

        {error && <p>{error}</p>}

        <div className={styles.buttons}>
          <button onClick={onClose}>
            Cancelar
          </button>

          <button onClick={save} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
