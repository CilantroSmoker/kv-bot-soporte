import { AlertCircle } from 'lucide-react';
import styles from '../styles/ShopInfo.module.css';

export default function ShopInfo() {
  return (
   <div className={styles.infoContainer}>
  {/* BIENVENIDA */}
	  <div className={styles.welcomeSection}>

	    <h2 className={styles.title}>
	      Bienvenido a nuestra tienda
	    </h2>

	    <p className={styles.description}>
	      ¡Te encuentras en la tienda oficial de Koshi Village! Aquí puedes
	      acceder a los mejores rangos, kits exclusivos y artículos VIP para
	      mejorar tu experiencia en el servidor.
	    </p>

	  </div>
      {/* POLÍTICA DE REEMBOLSOS - IMPORTANTE */}
      <div className={styles.refundPolicySection}>
        <div className={styles.refundHeader}>
          <AlertCircle size={28} />
          <h3> Política de Reembolsos</h3>
        </div>
        <div className={styles.refundContent}>
          <p className={styles.refundWarning}>
            <strong>Todos los pagos son no-reembolsables.</strong>
          </p>
          <p>
            Al comprar cualquier artículo de nuestra tienda, aceptas que la transacción es definitiva. 
            Intentar una devolución de un paquete resultará en <strong>una suspensión permanente</strong> de nuestro 
            servidor y tienda.
          </p>
          <p className={styles.refundSubtext}>
            Antes de confirmar tu orden, asegúrate de que realmente deseas el producto que vas a comprar.
          </p>
        </div>
    </div>
  </div>
  );
}
