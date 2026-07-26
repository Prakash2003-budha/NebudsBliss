import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RandomPicks.module.scss";
import ProductCard, { type Item } from "../productCard/ProductCard";

interface RandomPicksProps {
  items: Item[];
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

// Enough items to fill 2 full rows even on the widest grid (6 columns) -> 12.
const MAX_PICKS = 12;

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const RandomPicks: React.FC<RandomPicksProps> = ({
  items,
  isAdmin,
  deletingId,
  onOpenProduct,
  onDeleteClick,
  addToCart,
}) => {
  const navigate = useNavigate();

  // Reshuffled only when the underlying item list changes (not on every render).
  const picks = useMemo(() => shuffle(items).slice(0, MAX_PICKS), [items]);

  if (picks.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>You Might Also Like</h2>
      </div>

      <div className={styles.grid}>
        {picks.map((item) => (
          <div className={styles.gridItem} key={item._id}>
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

      <div className={styles.moreWrapper}>
        <button className={styles.moreBtn} onClick={() => navigate("/shop")}>
          See More
        </button>
      </div>
    </section>
  );
};

export default RandomPicks;
