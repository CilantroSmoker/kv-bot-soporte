import type { CSSProperties } from 'react';
import { rankData } from '../data/ranks';
import type { Product } from '../pages/Shop';
import styles from '../styles/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({
  product,
  onSelect,
}: ProductCardProps) {
  const data =
    product.type === 'RANK'
      ? rankData[product.name as keyof typeof rankData]
      : null;

  const rankColor = data?.color ?? '#c89b3c';

  const cardStyle = {
    '--rank-color': rankColor,
  } as CSSProperties;

  return (
    <article
      className={styles.card}
      style={cardStyle}
      onClick={() => onSelect(product)}
    >
      {/* Ornamento superior */}
      <div className={styles.ornament} aria-hidden="true">
        <div className={styles.ornamentTop}>
          <span>║</span>
        </div>

        <div className={styles.talisman}>
          <span className={styles.talismanSymbol}>◈</span>
          <span className={styles.talismanText}>勝守</span>
        </div>

        <div className={styles.ornamentStem} />
      </div>

      {/* Marco principal */}
      <div className={styles.frame}>

        {/* Esquina superior */}
        <div className={`${styles.corner} ${styles.cornerTL}`} />
        <div className={`${styles.corner} ${styles.cornerTR}`} />

        <div className={styles.content}>

          <div className={styles.rankType}>
            {product.type === 'RANK' ? 'RANGO' : product.type === 'KEY' ? 'TICKET' : product.type}
          </div>

          <h3 className={styles.title}>
            {product.name}
          </h3>

          {product.type === 'RANK' && data && (
            <div className={styles.stars} aria-label={`${data.stars} de 5 estrellas`}>
              <span className={styles.starsActive}>
                {'★'.repeat(data.stars)}
              </span>
              <span className={styles.starsInactive}>
                {'☆'.repeat(5 - data.stars)}
              </span>
            </div>
          )}

          <div className={styles.price}>
            <span className={styles.priceCurrency}>$</span>
            {Number(product.price).toFixed(2)}
          </div>

          <p className={styles.description}>
            {data?.shortDescription ?? product.description}
          </p>

          {product.type === 'RANK' && data && (
            <>
              <div className={styles.divider}>
                <span>◆</span>
              </div>

              <ul className={styles.highlights}>
                {data.highlights.map((highlight) => (
                  <li key={highlight}>
                    <span className={styles.highlightMark}>◈</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            type="button"
            className={styles.benefitsButton}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(product);
            }}
          >
            <span>VER BENEFICIOS</span>
            <span className={styles.buttonArrow}>→</span>
          </button>

        </div>

        {/* Esquina inferior */}
        <div className={`${styles.corner} ${styles.cornerBL}`} />
        <div className={`${styles.corner} ${styles.cornerBR}`} />

      </div>
    </article>
  );
}
