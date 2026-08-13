import React from "react";
import { Link } from "react-router-dom";
import styles from "./FeaturedPosters.module.scss";
import profile from "../../img/icons/profile.black.png";
import type { Item } from "../productCard/ProductCard";
import { isValidDiscount, cartDiscountPrice } from "../../utils/price";

interface FeaturedPostersProps {
  items: Item[];
  onOpenProduct: (item: Item) => void;
  addToCart: (item: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
  }) => void;
}

const FeaturedPosters: React.FC<FeaturedPostersProps> = ({
  items,
  onOpenProduct,
  addToCart,
}) => {
  if (!items.length) return null;

  const [heroItem, ...restItems] = items;

  const imageOf = (item: Item): string =>
    item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || (profile as string);

  const discountOf = (item: Item): { hasDiscount: boolean; percent: number } => {
    const hasDiscount = isValidDiscount(item.price, item.discountPrice);
    return {
      hasDiscount,
      percent: hasDiscount
        ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
        : 0,
    };
  };

  const renderHero = (item: Item) => {
    const image = imageOf(item);
    const { hasDiscount, percent } = discountOf(item);
    const price = hasDiscount ? item.discountPrice! : item.price;

    return (
      <article
        key={item._id}
        className={`${styles.poster} ${styles.heroPoster}`}
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

        <span className={styles.featuredRibbon}>★ Featured</span>
        {hasDiscount && <span className={styles.discountBadge}>-{percent}%</span>}

        <div className={styles.posterContent}>
          <span className={styles.posterCategory}>{item.category}</span>
          <h3 className={styles.posterTitle}>{item.name}</h3>
          {item.description && (
            <p className={styles.posterDesc}>{item.description}</p>
          )}

          <div className={styles.posterPriceRow}>
            {hasDiscount && (
              <span className={styles.oldPrice}>
                Rs. {item.price.toLocaleString("en-IN")}
              </span>
            )}
            <span className={styles.newPrice}>
              Rs. {price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className={styles.heroActions}>
            <span className={styles.posterCta}>
              Shop Now <span className={styles.ctaArrow}>→</span>
            </span>
            <button
              type="button"
              className={styles.quickAddBtn}
              onClick={(e) => {
                e.stopPropagation();
                addToCart({
                  _id: item._id,
                  name: item.name,
                  price: item.price,
                  discountPrice: cartDiscountPrice(item.price, item.discountPrice),
                  image,
                });
              }}
            >
              + Quick add
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderTile = (item: Item) => {
    const image = imageOf(item);
    const { hasDiscount, percent } = discountOf(item);
    const price = hasDiscount ? item.discountPrice! : item.price;

    return (
      <article
        key={item._id}
        className={`${styles.poster} ${styles.tilePoster}`}
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
        {hasDiscount && <span className={styles.discountBadge}>-{percent}%</span>}

        <div className={styles.posterContent}>
          <span className={styles.posterCategory}>{item.category}</span>
          <h3 className={styles.tileTitle}>{item.name}</h3>
          <div className={styles.tileFooter}>
            <div className={styles.tilePriceRow}>
              {hasDiscount && (
                <span className={styles.tileOldPrice}>
                  Rs. {item.price.toLocaleString("en-IN")}
                </span>
              )}
              <span className={styles.tilePrice}>
                Rs. {price.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              type="button"
              className={styles.tileAddBtn}
              aria-label={`Add ${item.name} to cart`}
              title="Add to cart"
              onClick={(e) => {
                e.stopPropagation();
                addToCart({
                  _id: item._id,
                  name: item.name,
                  price: item.price,
                  discountPrice: cartDiscountPrice(item.price, item.discountPrice),
                  image,
                });
              }}
            >
              <span className={styles.cartIcon}>＋</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>✦ Hand-picked for you</span>
          <h2>Featured Products</h2>
          <p>Our most-loved picks, curated from the catalog</p>
        </div>
        <Link to="/shop" className={styles.viewAll}>
          View all <span>→</span>
        </Link>
      </div>

      <div className={styles.postersGrid}>
        {renderHero(heroItem)}
        <div className={styles.tilesColumn}>
          {restItems.slice(0, 4).map(renderTile)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosters;
