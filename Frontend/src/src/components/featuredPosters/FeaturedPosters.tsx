import React from "react";
import styles from "./FeaturedPosters.module.scss";
import profile from "../../img/icons/profile.black.png";
import type { Item } from "../productCard/ProductCard";

interface FeaturedPostersProps {
  items: Item[];
  onOpenProduct: (item: Item) => void;
}

const FeaturedPosters: React.FC<FeaturedPostersProps> = ({ items, onOpenProduct }) => {
  if (!items.length) return null;

  const [heroItem, ...restItems] = items;

  const renderPoster = (item: Item, variant: "hero" | "tile") => {
    const image =
      item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || (profile as string);
    const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
    const discountPercent = hasDiscount
      ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
      : 0;

    return (
      <div
        key={item._id}
        className={`${styles.poster} ${variant === "hero" ? styles.heroPoster : styles.tilePoster}`}
        role="button"
        tabIndex={0}
        onClick={() => onOpenProduct(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpenProduct(item);
        }}
      >
        <img
          src={image}
          alt={item.name}
          className={styles.posterImage}
          onError={(e) => {
            (e.target as HTMLImageElement).src = profile as string;
          }}
        />
        <div className={styles.overlay} />

        {hasDiscount && <span className={styles.discountBadge}>-{discountPercent}%</span>}

        <div className={styles.posterContent}>
          <span className={styles.posterCategory}>{item.category}</span>
          <h3 className={styles.posterTitle}>{item.name}</h3>
          <div className={styles.posterPriceRow}>
            {hasDiscount && <span className={styles.oldPrice}>Rs. {item.price}</span>}
            <span className={styles.newPrice}>
              Rs. {hasDiscount ? item.discountPrice : item.price}
            </span>
          </div>
          <span className={styles.posterCta}>Shop Now &rarr;</span>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionHeader}>
        <h2>Featured Products</h2>
        <p>Hand-picked picks from our catalog</p>
      </div>

      <div className={styles.postersGrid}>
        {renderPoster(heroItem, "hero")}
        <div className={styles.tilesColumn}>
          {restItems.slice(0, 4).map((item) => renderPoster(item, "tile"))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosters;
