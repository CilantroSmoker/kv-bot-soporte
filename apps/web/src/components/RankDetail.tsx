import { useState } from "react";
import { ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import styles from "../styles/RankDetailModal.module.css";
import { useAuth } from "../context/AuthContext";
import { rankData } from "../data/ranks";
import type { Product } from "../pages/Shop";

interface Props {
  product: Product;
  addToCart: (product: Product) => void;
}

export default function RankDetail({
  product,
  addToCart,
}: Props) {

  const [showBenefits, setShowBenefits] = useState(false);
  const { user } = useAuth();

  const data = rankData[product.name as keyof typeof rankData];

  return (
    <div
      className={`${styles.modal} ${
        showBenefits ? styles.active : ""
      } ${styles[product.name.toLowerCase()]}`}
    >

      <div className={styles.slider}>

        <section className={styles.panel}>

          <div
            className={styles.rankHeader}
            data-rank={product.name.toLowerCase()}
          >

            <div className={styles.rankBanner}>
              <span>RANGO VIP</span>
            </div>

            <h2>{product.name}</h2>

            <div className={styles.rarity}>
              {Array.from({
                length: data?.stars ?? 1
              }).map((_, index) => (
                <span key={index}>★</span>
              ))}
            </div>

            <div className={styles.price}>
              ${Number(product.price).toFixed(2)}
            </div>

            <p>
              {product.description}
            </p>

          </div>


          <div className={styles.chatExample}>

            <span className={styles.chatChannel}>
              [TODOS]
            </span>{" "}

            <span
              className={styles.chatRank}
              style={{ color: data?.chatColor }}
            >
              [{product.name.toUpperCase()}]
            </span>{" "}

            <span className={styles.chatUser}>
              {user?.discordUsername ?? "Jugador"}
            </span>{" "}

            <span className={styles.chatArrow}>
              ▸
            </span>{" "}

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
              <ArrowRight size={18}/>
            </button>


            <button
              className={styles.buyBtn}
              onClick={() => {
                addToCart(product);
              }}
            >
              <ShoppingCart size={18}/>
              Añadir al carrito
            </button>

          </div>

        </section>


        <section className={styles.panel}>

          <div className={styles.benefitsHeader}>

            <button
              className={styles.backBtn}
              onClick={() => setShowBenefits(false)}
            >
              <ArrowLeft size={18}/>
              Volver
            </button>

            <h3>
              Beneficios
            </h3>

          </div>


          <div className={styles.details}>

            <div className={styles.benefitGroup}>
              <h4>⚔ Comandos</h4>

              {data?.benefits.comandos.map((item, index) => {
  if (typeof item === "string") {
    return (
      <div
        key={index}
        className={styles.benefitItem}
      >
        {item}
      </div>
    );
  }

  return (
    <div
      key={index}
      className={styles.benefitItem}
    >
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

              {data?.benefits.economia.map(item => (
                <div
                  key={item}
                  className={styles.benefitItem}
                >
                  {item}
                </div>
              ))}

            </div>


            <div className={styles.benefitGroup}>
              <h4>🎁 Extras</h4>

              {data?.benefits.extras.map(item => (
                <div
                  key={item}
                  className={styles.benefitItem}
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}
