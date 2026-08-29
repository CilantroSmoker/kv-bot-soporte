import { ShoppingCart, Trash2, X } from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import styles from "../styles/CartModal.module.css";

interface Props {
  onCheckout: () => void;
}

export default function CartModal({
  onCheckout,
}: Props) {
  const {
    cart,
    totalCart,
    cartExpanded,
    setCartExpanded,
    removeFromCart,
  } = useCart();

  const { user } = useAuth();

  if (!cartExpanded) {
    return null;
  }

  return (
    <div
      className={styles.cartOverlay}
      onClick={() => setCartExpanded(false)}
    >
      <div
        className={styles.cartContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.cartHeader}>
          <div className={styles.cartTitle}>
            <ShoppingCart size={24} />
            Carrito
          </div>

          <button
            onClick={() => setCartExpanded(false)}
            className={styles.closeButton}
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            El carrito está vacío
          </div>
        ) : (
          <>
            <div className={styles.cartList}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className={styles.cartItemRow}
                >
                  <div className={styles.cartItemInfo}>
                    <h4>
                      {item.product.name}
                    </h4>

                    <small>
                      ${Number(item.product.price).toFixed(2)} ×{" "}
                      {item.quantity}
                    </small>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      alignItems: "flex-end",
                    }}
                  >
                    <div className={styles.cartItemPrice}>
                      $
                      {(
                        item.product.price *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.product.id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff6b6b",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      aria-label={`Eliminar ${item.product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartFooter}>
              <div className={styles.cartTotal}>
                <span>Total:</span>

                <span>
                  ${Number(totalCart).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className={styles.checkoutButton}
              disabled={
                !user?.minecraftUsername ||
                !user?.email
              }
            >
              Confirmar Orden
            </button>
          </>
        )}
      </div>
    </div>
  );
}
