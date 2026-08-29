import { useEffect } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/LegalPages.module.css';

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
	<Layout>

  <div className={styles.container}>

    <div className={styles.header}>
      <h1>Términos y Condiciones</h1>
      <p className={styles.lastUpdate}>
        Última actualización: Julio 2026
      </p>
    </div>

    <div className={styles.content}>

      <section>
          <h2>1. Introducción</h2>
          <p>
            Bienvenido a la tienda oficial de Koshi Village. Estos Términos y Condiciones rigen el uso de nuestra 
            tienda en línea y la compra de productos digitales.
          </p>
          <p>
            Al acceder y utilizar esta tienda, aceptas estar vinculado por estos términos. Si no estás de acuerdo con 
            alguna parte, no debes utilizar nuestros servicios.
          </p>
        </section>

        {/* Política de Reembolsos */}
        <section className={styles.importantSection}>
          <h2>2. Política de Reembolsos (IMPORTANTE)</h2>
          <div className={styles.warningBox}>
            <strong>Todos los pagos son NO-REEMBOLSABLES.</strong>
          </div>
          <p>
            Al realizar una compra en nuestra tienda, aceptas que la transacción es <strong>definitiva e irreversible</strong>.
          </p>
          <p>
            No se aceptan devoluciones, cambios ni reembolsos bajo ninguna circunstancia. Esto incluye:
          </p>
          <ul>
            <li>Pagos realizados incorrectamente</li>
            <li>Compras duplicadas</li>
            <li>Arrepentimiento después de la compra</li>
            <li>Reclamos de cualquier naturaleza</li>
          </ul>
          <p className={styles.warning}>
            Intentar una devolución resultará en <strong>una suspensión permanente</strong> de tu cuenta en el servidor 
            y la tienda, así como un posible bloqueo de IP.
          </p>
        </section>

        {/* Requisitos de Compra */}
        <section>
          <h2>3. Requisitos y Responsabilidades</h2>
          <p>Al comprar en nuestra tienda, aceptas que:</p>
          <ul>
            <li>
              <strong>Eres mayor de 16 años</strong> (o tienes consentimiento parental si eres menor)
            </li>
            <li>
              <strong>Tu cuenta de Minecraft es legal</strong> y no ha sido obtenida ilegalmente
            </li>
            <li>
              No intentarás vender, intercambiar o transferir beneficios adquiridos
            </li>
            <li>
              Cumplirás con todas las reglas y normas del servidor
            </li>
          </ul>
        </section>

	{/* Transferencia de Rangos y Productos */}
	<section>
	  <h2>4. Transferencia de Rangos y Productos</h2>

	  <p>
	    Los rangos, productos digitales y beneficios adquiridos en la tienda de
	    Koshi Village están asociados exclusivamente a la cuenta utilizada al
	    momento de realizar la compra.
	  </p>

	  <p>
	    Los rangos y beneficios son personales e intransferibles. No está permitido
	    regalar, vender, intercambiar o transferir productos adquiridos a otras
	    cuentas o usuarios.
	  </p>

	  <p>
	    Koshi Village no realiza cambios de propietario, transferencias de rangos ni
	    modificaciones de cuenta asociadas a compras realizadas.
	  </p>
	</section>

        {/* Métodos de Pago */}
        <section>
          <h2>5. Métodos de Pago</h2>
          <p>
            Los pagos son procesados por <strong>Flow</strong>, una plataforma tercera especializada en pagos online.
          </p>
          <p>
            Todos los pagos están completamente cifrados y protegidos. <strong>Nunca almacenamos datos bancarios</strong>.
          </p>
          <p>
            Si tu método de pago no aparece disponible, contacta con Flow, no con nosotros. Nosotros no tenemos control 
            sobre los métodos de pago disponibles.
          </p>
        </section>

        {/* Suspensión de Cuenta */}
        <section className={styles.importantSection}>
          <h2>6. Suspensión y Bloqueo de Cuenta</h2>
          <p>
            Koshi Village se reserva el derecho de suspender permanentemente tu cuenta si:
          </p>
          <ul>
            <li>Intentas una devolución o reclamación de pago</li>
            <li>Violas las normas del servidor</li>
            <li>Utilizas hacks, mods no autorizados o exploits</li>
            <li>Acosas/amenazas a otros jugadores o staff</li>
            <li>Utilizas cuentas alternativas para evadir sanciones de otra cuenta.</li>
            <li>Realizas actividades ilegales</li>
          </ul>
        </section>

        {/* Contenido y Cambios */}
        <section>
          <h2>7. Cambios en Contenido y Servicios</h2>
          <p>
            Koshi Village se reserva el derecho de:
          </p>
          <ul>
            <li>Modificar, actualizar o eliminar productos de la tienda en cualquier momento</li>
            <li>Cambiar precios sin previo aviso</li>
            <li>Pausar temporalmente la tienda por mantenimiento</li>
            <li>Cambiar beneficios de rangos si es necesario por balanceo del servidor</li>
          </ul>
          <p>
            Los cambios no afectan a compras ya realizadas, pero futuras compras estarán sujetas a los nuevos términos.
          </p>
        </section>

        {/* Responsabilidad */}
        <section>
          <h2>8. Limitación de Responsabilidad</h2>
          <p>
            Koshi Village no se hace responsable por:
          </p>
          <ul>
            <li>Pérdida de datos o corrupción de cuentas</li>
            <li>Caídas del servidor o mantenimiento</li>
            <li>Cambios en Minecraft que afecten los productos</li>
            <li>Actividades de terceros (hacks, griefs, etc.)</li>
            <li>Problemas técnicos en tu conexión</li>
          </ul>
        </section>

        {/* Cambios a los Términos */}
        <section>
          <h2>9. Cambios a estos Términos</h2>
          <p>
            Nos reservamos el derecho de actualizar estos términos en cualquier momento. Tu continuo uso de la tienda 
            después de cambios significa que aceptas los nuevos términos.
          </p>
        </section>

        {/* Contacto */}
        <section>
          <h2>10. Contacto y Soporte</h2>
          <p>
            Si tienes dudas sobre estos términos, contáctanos:
          </p>
          <ul>
            <li>
              <strong>Email:</strong> <a href="mailto:koshivillage@gmial.com">koshivillage@gmail.com</a>
            </li>
            <li>
              <strong>Discord:</strong> Servidor oficial de Koshi Village
            </li>
          </ul>
        </section>

        {/* Final */}
                {/* Final */}
        <section className={styles.finalSection}>
          <p>
            <strong>
              Al realizar una compra, reconoces que has leído, entendido y
              aceptas estos Términos y Condiciones.
            </strong>
          </p>
        </section>
      </div>

      {/* Ornamento de cierre */}
      <div className={styles.bottomOrnament}>
        <span />
        <strong>❖</strong>
        <span />
      </div>

    </div>
  </Layout>
);
}
