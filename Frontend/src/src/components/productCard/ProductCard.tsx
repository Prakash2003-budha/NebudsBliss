import React from "react";

import styles from "./ProductCard.module.scss";
import profile from "../../img/icons/profile.black.png";
import cart from "../../img/icons/cart.png";
import deleteIcon from "../../img/icons/delete.png";

export interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: { url: string; optimizeUrl: string }[];
  category: string;
  brand?: string;
  isActive: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  createdAt?: string;
}

interface ProductCardProps {
  item: Item;
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

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isAdmin,
  deletingId,
  onOpenProduct,
  onDeleteClick,
  addToCart,
}) => {
  const imageSrc =
    item.images && item.images.length > 0
      ? item.images[0].optimizeUrl || item.images[0].url
      : (profile as string);

  const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
  const isOutOfStock = (item.stockQuantity ?? 1) <= 0;
  const discountPercent = hasDiscount
    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
    : 0;

  return (
    <div
      className={`${styles.productCard} ${isOutOfStock ? styles.outOfStock : ""}`}
      onClick={() => onOpenProduct(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenProduct(item);
      }}
    >
      <div className={styles.imageWrapper}>
        <span className={styles.categoryTag}>{item.category}</span>
        {hasDiscount && <span className={styles.saleTag}>-{discountPercent}%</span>}
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = profile as string;
          }}
        />
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span>Out of Stock</span>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>

        <div className={styles.priceRow}>
          <span className={styles.price}>Rs. {(item.discountPrice ?? item.price).toLocaleString()}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>Rs. {item.price.toLocaleString()}</span>
          )}
        </div>

        <div className={styles.cardActions}>
          <button
            className={styles.addToCartBtn}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: item._id,
                name: item.name,
                price: item.price,
                discountPrice: item.discountPrice,
                image: imageSrc,
              });
            }}
          >
            <img src={cart} alt="" className={styles.cartIcon} />
            {isOutOfStock ? "Unavailable" : "Add to cart"}
          </button>
          {isAdmin && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(item);
              }}
              disabled={deletingId === item._id}
              aria-label={`Delete ${item.name}`}
              title="Delete item"
            >
              {deletingId === item._id ? (
                <span className={styles.spinner} />
              ) : (
                <img src={deleteIcon} alt="" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
