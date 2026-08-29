import { useEffect } from "react";
import Layout from '../components/Layout';
import styles from '../styles/LegalPages.module.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

return (
  <Layout>
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Política de Privacidad</h1>
        <p className={styles.lastUpdate}>
          Última actualización: Agosto 2026
        </p>
      </div>

      <div className={styles.content}>
        {/* Introducción */}
        <section>
          <h2>1. Introducción</h2>
          <p>
            En Koshi Village, tu privacidad es importante para nosotros...
          </p>
        </section>

        {/* Información que Recopilamos */}
        <section>
          <h2>2. ¿Qué Información Recopilamos?</h2>
          <p>Recopilamos información que nos proporcionas directamente cuando:</p>
          <ul>
            <li>Te registras en nuestra tienda</li>
            <li>Vinculas tu cuenta de Minecraft</li>
            <li>Registras tu dirección de email</li>
            <li>Realizas una compra</li>
            <li>Contactas con nuestro soporte</li>
          </ul>
          <p>
            <strong>La información que recopilamos incluye:</strong>
          </p>
          <ul>
            <li>Tu nombre de usuario de Discord</li>
            <li>Tu ID de Discord</li>
            <li>Tu nombre de usuario de Minecraft</li>
            <li>Tu UUID de Minecraft</li>
            <li>Tu dirección de email</li>
            <li>Información de pagos (procesada por Flow, no nosotros)</li>
            <li>Tu dirección IP</li>
            <li>Información sobre tus compras y transacciones</li>
          </ul>
        </section>

        {/* Cómo Usamos tu Información */}
        <section>
          <h2>3. ¿Cómo Usamos tu Información?</h2>
          <p>Utilizamos tu información para:</p>
          <ul>
            <li>
              <strong>Procesar compras:</strong> Entregar los productos que compraste en el servidor
            </li>
            <li>
              <strong>Comunicación:</strong> Enviarte notificaciones sobre tu compra, actualizaciones o avisos importantes
            </li>
            <li>
              <strong>Soporte:</strong> Responder a tus consultas y resolver problemas
            </li>
            <li>
              <strong>Seguridad:</strong> Detectar fraude y proteger nuestra plataforma
            </li>
            <li>
              <strong>Mejora del servicio:</strong> Entender cómo usas la tienda para mejorarla
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Cumplir con leyes y regulaciones aplicables
            </li>
          </ul>
        </section>

        {/* Protección de Datos */}
        <section className={styles.importantSection}>
          <h2>4. Protección de tu Información</h2>
          <p>
            Nos comprometemos a proteger tu información personal. Implementamos medidas de seguridad técnicas y 
            organizacionales para evitar acceso no autorizado.
          </p>
          <div className={styles.warningBox}>
            <strong>Importante:</strong> Aunque nos esforzamos por proteger tu información, ningún método de transmisión 
            por internet es 100% seguro. Utilizas nuestros servicios bajo tu propio riesgo.
          </div>
          <p>
            <strong>Información de Pagos:</strong> Los datos bancarios y de tarjeta de crédito son procesados y almacenados 
            por Flow, no por nosotros. Nunca tenemos acceso a tus datos financieros completos.
          </p>
        </section>

        {/* Retención de Datos */}
        <section>
          <h2>5. Retención de Datos</h2>
          <p>
            Retenemos tu información personal mientras sea necesario para proporcionar nuestros servicios. Esto incluye:
          </p>
          <ul>
            <li>
              <strong>Mientras tengas una cuenta:</strong> Mantenemos toda tu información para acceso y soporte
            </li>
            <li>
              <strong>Después de eliminar tu cuenta:</strong> Podemos retener información para:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Cumplimiento legal y fiscal</li>
                <li>Disputas y reembolsos (aunque nuestras compras son no-reembolsables)</li>
                <li>Seguridad (prevención de fraude)</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Terceros */}
        <section>
          <h2>6. Compartir con Terceros</h2>
          <p>
            <strong>No compartimos tu información personal con terceros,</strong> con las excepciones necesarias:
          </p>
          <ul>
            <li>
              <strong>Flow:</strong> Para procesar pagos. Están obligados a proteger tu información bajo sus 
              propios términos de privacidad.
            </li>
            <li>
              <strong>Discord:</strong> Solo usamos tu ID y nombre de usuario de Discord para identificarte
            </li>
            <li>
              <strong>Requerimiento legal:</strong> Si la ley lo exige, podemos compartir información con autoridades
            </li>
          </ul>
        </section>

        {/* Tus Derechos */}
        <section>
          <h2>7. Tus Derechos</h2>
          <p>
            Tienes derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceder:</strong> Solicitar una copia de tu información personal
            </li>
            <li>
              <strong>Rectificar:</strong> Corregir información incorrecta
            </li>
            <li>
              <strong>Eliminar:</strong> Solicitar la eliminación de tu información (con limitaciones legales)
            </li>
            <li>
              <strong>Oposición:</strong> Oponerte al procesamiento de tu información
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, contacta: <a href="mailto:koshivillage@gmail.com">koshivillage@gmail.com</a>
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2>8. Cookies y Tecnologías de Seguimiento</h2>
          <p>
            Utilizamos cookies y tecnologías similares para:
          </p>
          <ul>
            <li>Mantener tu sesión iniciada</li>
            <li>Recordar tus preferencias</li>
            <li>Analizar cómo usas la tienda</li>
            <li>Prevenir fraude</li>
          </ul>
          <p>
            Puedes controlar las cookies en la configuración de tu navegador. Sin embargo, deshabilitarlas podría afectar 
            la funcionalidad de la tienda.
          </p>
        </section>

        {/* Cambios */}
        <section>
          <h2>9. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad en cualquier momento. Te notificaremos de cambios significativos 
            por email. Tu continuo uso de la tienda significa que aceptas los cambios.
          </p>
        </section>

        {/* Contacto */}
        <section>
          <h2>10. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta Política de Privacidad, contáctanos:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:koshivillage@gmail.com">
                koshivillage@gmail.com
              </a>
            </li>
            <li>
              <strong>Discord:</strong> Servidor oficial de Koshi Village
            </li>
          </ul>
        </section>

        {/* Final */}
                <section className={styles.finalSection}>
          <p>
            <strong>
              Tu privacidad es importante para nosotros. Nos comprometemos a
              proteger tus datos personales.
            </strong>
          </p>
        </section>

      </div>

      <div className={styles.bottomOrnament}>
        <span />
        <strong>❖</strong>
        <span />
      </div>

    </div>
  </Layout>
);
}
