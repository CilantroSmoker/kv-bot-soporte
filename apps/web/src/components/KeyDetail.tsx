import { X, Ticket, ShoppingCart } from "lucide-react";
import styles from "../styles/KeyDetail.module.css";
import type { Product } from "../pages/Shop";

interface Props {
  product: Product;
  onClose: () => void;
  addToCart: (product: Product) => void;
}

export default function KeyDetail({
  product,
  onClose,
  addToCart
}: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>

        <section className={styles.panel}>
          <div className={styles.productContent}>
            <div className={styles.keyBanner}>
              <span>TICKET / CRATE</span>
            </div>

            <div className={styles.productIconContainer}>
              <Ticket size={50} />
            </div>

            <div className={styles.keyHeader}>
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
                <li>Se reclama en el NPC dentro del servidor.</li>
                <li>Úsalo en la caja de tickets para recibir una llave al azar.</li>
                <li>Los tickets se entregan en un stack apilable.</li>
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
