import { useState } from "react";
import { X, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import styles from "../styles/RankDetailModal.module.css";
import { useAuth } from "../context/AuthContext";
import { rankData } from "../data/ranks";
import type { Product } from "../pages/Shop";

interface RankDetailsModalProps {
  rank: Product | null;
  onClose: () => void;
  addToCart: (product: Product) => void;
  allProducts: Product[];
}

export default function RankDetailModal({
  rank,
  onClose,
  addToCart,
  allProducts,
}: RankDetailsModalProps) {
  const [showBenefits, setShowBenefits] = useState(false);
  const [duration, setDuration] = useState<"permanent" | "month">("permanent");
  
  const { user } = useAuth();
  if (!rank) return null;

  const data = rankData[rank.name as keyof typeof rankData];

  const pricePermanent = Number(rank.price).toFixed(2);
  const priceMonth = (Number(rank.price) * 0.35).toFixed(2); 
  const currentPrice = duration === "permanent" ? pricePermanent : priceMonth;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${
          showBenefits ? styles.active : ""
        } ${styles[rank.name.toLowerCase()]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>

        <div className={styles.slider}>
          {/* PANEL IZQUIERDO */}
          <section className={styles.panel}>
            <div
              className={styles.rankHeader}
              data-rank={rank.name.toLowerCase()}
            >
              <div className={styles.rankBanner}>
                <span>RANGO VIP</span>
              </div>

              <h2>{rank.name}</h2>

              <div className={styles.rarity}>
                {Array.from({
                  length: data?.stars ?? 1,
                }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>

              {/* SELECTOR DE DURACIÓN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0', textAlign: 'left' }}>
                
                {/* Opción Permanente */}
                <div 
                  onClick={() => setDuration('permanent')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                    border: duration === 'permanent' ? '2px solid #d4af37' : '2px solid #333',
                    backgroundColor: duration === 'permanent' ? 'rgba(212, 175, 55, 0.05)' : '#121212'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#111',
                      border: duration === 'permanent' ? '6px solid #d4af37' : '2px solid #555'
                    }} />
                    <span style={{ fontWeight: 'bold', color: duration === 'permanent' ? '#fff' : '#aaa' }}>Permanente</span>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#d4af37'
                    }}>PAGO ÚNICO</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>${pricePermanent}</span>
                </div>

                {/* Opción 1 Mes */}
                <div 
                  onClick={() => setDuration('month')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                    border: duration === 'month' ? '2px solid #d4af37' : '2px solid #333',
                    backgroundColor: duration === 'month' ? 'rgba(212, 175, 55, 0.05)' : '#121212'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#111',
                      border: duration === 'month' ? '6px solid #d4af37' : '2px solid #555'
                    }} />
                    <span style={{ fontWeight: 'bold', color: duration === 'month' ? '#fff' : '#aaa' }}>1 Mes</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>${priceMonth}</span>
                </div>

              </div>

              <div className={styles.price} style={{ marginBottom: '15px' }}>
                ${currentPrice}
              </div>

              <p>{rank.description}</p>
            </div>

            <div className={styles.chatExample}>
              <span className={styles.chatChannel}>[TODOS]</span>{" "}
              <span
                className={styles.chatRank}
                style={{ color: data?.chatColor }}
              >
                [{rank.name.toUpperCase()}]
              </span>{" "}
              <span className={styles.chatUser}>
                {user?.discordUsername ?? "Jugador"}
              </span>{" "}
              <span className={styles.chatArrow}>▸</span>{" "}
              <span
                className={styles.chatMessage}
                style={{ color: data?.chatColor }}
              >
                ¡Tú eres pobre, tú no tienes iPhone!
              </span>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowBenefits(true)}
              >
                Ver beneficios
                <ArrowRight size={18} />
              </button>

              <button
                className={styles.buyBtn}
                onClick={() => {
                  let productToAdd = rank;

                  if (duration === "month") {
                    const monthlyVariant = allProducts.find(
                      (p) =>
                        p.type === "RANK_MONTH" &&
                        p.name.toLowerCase().includes(rank.name.toLowerCase())
                    );

                    if (monthlyVariant) {
                      productToAdd = monthlyVariant;
                    } else {
                      alert(`Error: No se encontró la variante mensual para ${rank.name}. Asegúrate de ejecutar 'npx prisma db seed'.`);
                      return;
                    }
                  }

                  addToCart(productToAdd);
                  onClose();
                }}
              >
                <ShoppingCart size={18} />
                Añadir al carrito
              </button>
            </div>
          </section>

          {/* PANEL DERECHO */}
          <section className={styles.panel}>
            <div className={styles.benefitsHeader}>
              <button
                className={styles.backBtn}
                onClick={() => setShowBenefits(false)}
              >
                <ArrowLeft size={18} />
                Volver
              </button>

              <h3>Beneficios</h3>
            </div>

            <div className={styles.details}>
              <div className={styles.benefitGroup}>
                <h4>⚔ Comandos</h4>
                {data?.benefits.comandos.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div key={index} className={styles.benefitItem}>
                        {item}
                      </div>
                    );
                  }

                  return (
                    <div key={index} className={styles.benefitItem}>
                      <strong>{item.name}</strong>

                      {item.description && (
                        <div className={styles.benefitDescription}>
                          {Array.isArray(item.description)
                            ? item.description.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))
                            : item.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.benefitGroup}>
                <h4>💰 Economía</h4>
                {data?.benefits.economia.map((item) => (
                  <div key={item} className={styles.benefitItem}>
                    {item}
                  </div>
                ))}
              </div>

              <div className={styles.benefitGroup}>
                <h4>🎁 Extras</h4>
                {data?.benefits.extras.map((item) => (
                  <div key={item} className={styles.benefitItem}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
