import { X, Coins, ShoppingCart } from "lucide-react";
import styles from "../styles/BalanceDetail.module.css";
import type { Product } from "../pages/Shop";

interface Props {
  product: Product;
  onClose: () => void;
  addToCart: (product: Product) => void;
}

export default function BalanceDetail({
  product,
  onClose,
  addToCart
}: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22}/>
        </button>

        <section className={styles.panel}>
          <div className={styles.productContent}>
            <div className={styles.rankBanner}>
              <span>BALANCE</span>
            </div>

            <div className={styles.productIconContainer}>
              <Coins size={50} />
            </div>

            <div className={styles.rankHeader}>
              <h2>{product.name}</h2>
              <div className={styles.price}>
                ${Number(product.price).toFixed(2)}
              </div>
              <p>{product.description}</p>
            </div>

            <div className={styles.productSection}>
              <span className={styles.productSectionTitle}>
                Información
              </span>
              <ul className={styles.productList}>
                <li>Se acredita automáticamente en tu cuenta.</li>
                <li>Disponible una vez confirmado el pago.</li>
                <li>Se entrega al jugador vinculado a la tienda.</li>
              </ul>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.buyBtn}
              onClick={() => {
                addToCart(product);
                onClose();
              }}
            >
              <ShoppingCart size={18} />
              Añadir al carrito
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
