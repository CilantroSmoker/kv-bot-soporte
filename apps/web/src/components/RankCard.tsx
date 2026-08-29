import type { Product } from '../pages/Shop';
import type { CSSProperties } from 'react';
import styles from '../styles/RankCard.module.css';

interface RankData {
  color: string;
  chatColor: string;
  stars: number;
  rarity: string;
  shortDescription: string;
  highlights: string[];
}

interface RankCardProps {
  product: Product;
  data: RankData;
  onClick: () => void;
}

export default function RankCard({
  product,
  data,
  onClick,
}: RankCardProps) {
  const cardStyle = {
    '--rank-color': data.color,
  } as CSSProperties;

  return (
    <article
      className={styles.rankCard}
      style={cardStyle}
      onClick={onClick}
    >
      {/* Ornamento superior */}
      <div className={styles.ornament}>
        <div className={styles.ornamentTop}>
          <span className={styles.ornamentSymbol}>◈</span>
          <span className={styles.ornamentKanji}>勝守</span>
        </div>

        <div className={styles.ornamentStem} />
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className={styles.cardBody}>

        <div className={styles.rankRarity}>
          {data.rarity}
        </div>

        <h3 className={styles.rankName}>
          {product.name}
        </h3>

        <div className={styles.stars} aria-label={`${data.stars} de 5 estrellas`}>
          {'★'.repeat(data.stars)}
          <span className={styles.emptyStars}>
            {'☆'.repeat(5 - data.stars)}
          </span>
        </div>

        <div className={styles.price}>
          ${Number(product.price).toFixed(2)}
        </div>

        <p className={styles.description}>
          {data.shortDescription}
        </p>

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

        <button
          type="button"
          className={styles.benefitsButton}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          <span>VER BENEFICIOS</span>
          <span className={styles.buttonArrow}>→</span>
        </button>

      </div>
    </article>
  );
}
