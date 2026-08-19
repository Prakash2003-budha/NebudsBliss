import React from "react";

import styles from "./ProductCard.module.scss";
import profile from "../../img/icons/profile.black.png";
import cart from "../../img/icons/cart.png";
import deleteIcon from "../../img/icons/delete.png";
import { effectivePrice, isValidDiscount, cartDiscountPrice } from "../../utils/price";

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
  specs?: {
    batteryCapacity?: number;
    batteryType?: string;
    bluetoothVersion?: string;
    fastCharging?: boolean;
    weight?: number;
    dimensions?: string;
    warrantyPeriod?: number;
    colorOptions?: string[];
    compatibility?: string;
  };
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
  // Compare feature
  isComparing?: boolean;
  onCompareToggle?: (item: Item) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isAdmin,
  deletingId,
  onOpenProduct,
  onDeleteClick,
  addToCart,
  isComparing,
  onCompareToggle,
}) => {
  const imageSrc =
    item.images && item.images.length > 0
      ? item.images[0].optimizeUrl || item.images[0].url
      : (profile as string);

  const hasDiscount = isValidDiscount(item.price, item.discountPrice);
  const stock = item.stockQuantity ?? 1;
  const isOutOfStock = stock <= 0;
  const lowStock = !isOutOfStock && stock <= 5;
  const availabilityLabel = isOutOfStock
    ? "Out of stock"
    : lowStock
    ? `Only ${stock} left`
    : "In stock";
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
        {item.isFeatured && <span className={styles.featuredTag}>★ Featured</span>}
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
        {item.brand && <span className={styles.brand}>{item.brand}</span>}
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{item.description}</p>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            <span className={styles.currency}>Rs.</span>
            {effectivePrice(item.price, item.discountPrice).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              Rs. {item.price.toLocaleString()}
            </span>
          )}
        </div>

        <div className={styles.availability}>
          <span
            className={`${styles.availDot} ${
              isOutOfStock ? styles.dotOut : lowStock ? styles.dotLow : styles.dotIn
            }`}
          />
          <span>{availabilityLabel}</span>
        </div>

        <div className={styles.cardActions}>
          {onCompareToggle && (
            <button
              type="button"
              className={`${styles.compareBtn} ${isComparing ? styles.compareBtnActive : ""}`}
              title={isComparing ? "Remove from compare" : "Add to compare"}
              aria-pressed={!!isComparing}
              onClick={(e) => {
                e.stopPropagation();
                onCompareToggle(item);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 9h11M4 15h16M19 6l3 3-3 3M5 18l-3-3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button
            className={styles.addToCartBtn}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: item._id,
                name: item.name,
                price: item.price,
                discountPrice: cartDiscountPrice(item.price, item.discountPrice),
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
