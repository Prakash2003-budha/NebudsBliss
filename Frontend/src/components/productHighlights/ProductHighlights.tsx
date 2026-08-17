import React, { useRef } from "react";
import styles from "./ProductHighlights.module.scss";
import ProductCard, { type Item } from "../productCard/ProductCard";

interface ProductHighlightsProps {
  items: Item[];
  title?: string;
  isAdmin: boolean;
  deletingId: string | null;
  onOpenProduct: (item: Item) => void;
  onDeleteClick: (item: Item) => void;
  addToCart: (item: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
  }) => void;
}

const ProductHighlights: React.FC<ProductHighlightsProps> = ({
  items,
  title = "Product Highlights",
  isAdmin,
  deletingId,
  onOpenProduct,
  onDeleteClick,
  addToCart,
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
        {items.map((item) => (
          <div className={styles.card} key={item._id}>
            <ProductCard
              item={item}
              isAdmin={isAdmin}
              deletingId={deletingId}
              onOpenProduct={onOpenProduct}
              onDeleteClick={onDeleteClick}
              addToCart={addToCart}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
export default ProductHighlights;
