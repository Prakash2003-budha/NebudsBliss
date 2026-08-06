import React, { useRef } from "react";
import styles from "./ProductHighlights.module.scss";
import profile from "../../img/icons/profile.black.png";
import type { Item } from "../productCard/ProductCard";

interface ProductHighlightsProps {
  items: Item[];
  title?: string;
  onOpenProduct: (item: Item) => void;
}

const ProductHighlights: React.FC<ProductHighlightsProps> = ({
  items,
  title = "Product Highlights",
  onOpenProduct,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const amount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!items.length) return null;
  return (
    <section className={styles.highlights}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <div className={styles.nav}>
          <button aria-label="Scroll left" onClick={() => scroll("left")}>
            &#10094;
          </button>
          <button aria-label="Scroll right" onClick={() => scroll("right")}>
            &#10095;
          </button>
        </div>
      </div>

      <div className={styles.track} ref={scrollRef}>
        {items.map((item) => {
          const bigImage =
            item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || (profile as string);
          const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
          const discountPercent = hasDiscount
            ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
            : 0;
          return (
            <div
              className={styles.card}
              key={item._id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenProduct(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenProduct(item);
              }}
            >
              <div className={styles.imagePanel}>
                <img
                  src={bigImage}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = profile as string;
                  }}
                />
                {hasDiscount && (
                  <span className={styles.offBadge}>-{discountPercent}% off</span>
                )}
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{item.name}</h3>
                <div className={styles.priceRow}>
                  {hasDiscount && <span className={styles.oldPrice}>Rs. {item.price}</span>}
                  <span className={styles.newPrice}>
                    Rs. {hasDiscount ? item.discountPrice : item.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default ProductHighlights;
