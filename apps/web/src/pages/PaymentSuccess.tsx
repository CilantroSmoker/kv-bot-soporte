import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import {
  CheckCircle2,
  Gamepad2,
  Mail,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import styles from '../styles/PaymentSuccess.module.css';

interface OrderItem {
   product: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: {
    minecraftUsername: string;
    minecraftUuid: string;
    email: string;
  };
  items: OrderItem[];
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      setError('No se encontró el ID de la orden');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await apiFetch(`/orders/${orderId}`);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        Cargando detalles de tu compra...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          ❌ {error}
        </div>

        <button
          onClick={() => navigate('/')}
          className={styles.backButton}
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  const totalUSD = parseFloat(order.totalAmount.toString());

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    'es-CL',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return (
    <div className={styles.container}>

      {/* =====================================================
          PERGAMINO
      ====================================================== */}

      <main className={styles.parchment}>

        {/* Decoración superior */}
        <div className={styles.scrollTop} />

        <div className={styles.parchmentInner}>

          {/* =================================================
              HEADER
          ================================================== */}

          <header className={styles.header}>

            <CheckCircle2
              size={64}
              color="#8A271E"
              style={{ margin: '0 auto 1rem' }}
            />

            <h1 className={styles.title}>
              ¡Pago Confirmado!
            </h1>

            <p className={styles.subtitle}>
              Tu compra ha sido procesada exitosamente
            </p>

          </header>

          {/* =================================================
              AGRADECIMIENTO
          ================================================== */}

          <section className={styles.successBox}>

            <p className={styles.successText}>
              ¡Gracias por tu compra, {order.user.minecraftUsername}!
              Los artículos serán entregados automáticamente
              en tu cuenta de Minecraft en los próximos minutos.
            </p>

          </section>

          {/* =================================================
              DETALLES DE LA ORDEN
          ================================================== */}

          <section className={styles.card}>

            {/* ID DE ORDEN */}
            <div className={styles.cardRow}>

              <FileText size={20} />

              <div>
                <div className={styles.rowLabel}>
                  ID de Orden
                </div>

                <div className={styles.rowValueMono}>
                  {order.id}
                </div>
              </div>

            </div>

            {/* CUENTA DE MINECRAFT */}
            <div className={styles.cardRow}>

              <Gamepad2 size={20} />

              <div>
                <div className={styles.rowLabel}>
                  Cuenta de Minecraft
                </div>

                <div className={styles.rowValue}>
                  {order.user.minecraftUsername}
                </div>
              </div>

            </div>

            {/* EMAIL */}
            <div className={styles.cardRow}>

              <Mail size={20} />

              <div>
                <div className={styles.rowLabel}>
                  Email
                </div>

                <div className={styles.rowValue}>
                  {order.user.email}
                </div>
              </div>

            </div>

            {/* MONTO */}
            <div className={styles.cardRow}>

              <DollarSign size={20} />

              <div>
                <div className={styles.rowLabel}>
                  Monto Pagado
                </div>

                <div className={styles.rowValueAmount}>
                  ${totalUSD.toFixed(2)} USD
                </div>
              </div>

            </div>

            {/* FECHA */}
            <div className={styles.cardRowLast}>

              <Calendar size={20} />

              <div>
                <div className={styles.rowLabel}>
                  Fecha de Compra
                </div>

                <div className={styles.rowValue}>
                  {formattedDate}
                </div>
              </div>

            </div>

          </section>

          {/* =================================================
              ITEMS
          ================================================== */}

          <section className={styles.itemsSection}>

            <h3 className={styles.itemsTitle}>
              Items incluidos
            </h3>

            <div className={styles.itemsList}>

              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={styles.itemCard}
                >

                  <div>

                    <div className={styles.itemName}>
                      {item.product.name}
                    </div>

                    <div className={styles.itemQuantity}>
                      Cantidad: {item.quantity}
                    </div>

                  </div>

                  <div className={styles.itemPrice}>
                    $
                    {(
                      item.product.price * item.quantity
                    ).toFixed(2)}
                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* =================================================
              FIRMA / SELLO
          ================================================== */}

          <footer className={styles.footerNote}>

            <p>
              Puedes cerrar esta pestaña.
            </p>

          </footer>

        </div>

        {/* Decoración inferior */}
        <div className={styles.scrollBottom} />

      </main>

    </div>
  );
}
