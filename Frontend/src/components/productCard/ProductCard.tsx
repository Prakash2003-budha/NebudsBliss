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

  return (
    <div
      className={styles.productCard}
      onClick={() => onOpenProduct(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenProduct(item);
      }}
    >
      <div className={styles.categoryTabContainer}>
        <span className={styles.categoryTab}>{item.category}</span>
      </div>
      <div className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = profile as string;
          }}
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.nameRow}>
          <h3>{item.name}</h3>
          <span className={styles.priceBadge}>
            Rs. {item.discountPrice ? item.discountPrice : item.price}
          </span>
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.cardActions}>
          <button
            className={styles.addToCartBtn}
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
            Add To Cart
          </button>
          {isAdmin && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(item);
              }}
              disabled={deletingId === item._id}
            >
              {deletingId === item._id ? (
                "Deleting..."
              ) : (
                <>
                  <img src={deleteIcon} alt="" />
                  Delete
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;