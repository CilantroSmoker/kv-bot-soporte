import { useState } from "react";
import { apiFetch } from "../services/api";
import styles from "../styles/Modal.module.css";

interface Props {
  currentUsername?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MinecraftModal({
  currentUsername,
  onClose,
  onSuccess,
}: Props) {
  const [username, setUsername] = useState(currentUsername ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setLoading(true);
    setError("");

    try {
      await apiFetch("/shop/link-minecraft", {
        method: "POST",
        body: JSON.stringify({
          minecraftUsername: username,
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
        <h2>Vincular Minecraft</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nombre de usuario"
        />

        {error && <p>{error}</p>}

        <div className={styles.buttons}>
          <button onClick={onClose}>
            Cancelar
          </button>

          <button
            onClick={save}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
