import React, { useEffect, useState } from "react";
import styles from "./Productdetailmodal.module .scss";
import { useCart } from "../../context/userCart";
import profile from "../../img/icons/profile.black.png";

interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: { url: string; optimizeUrl: string }[];
  category: string;
  isActive: boolean;
}

interface ProductDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "details" | "reviews";

// Holds all "per product" transient UI state (quantity, active image, active tab).
// Mounted with key={item._id} from the parent, so React resets this state for us
// whenever the product changes — no setState-in-an-effect needed.
const ProductDetailContent: React.FC<{
  item: Item;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  const images = item.images && item.images.length > 0 ? item.images : null;
  const activeImage = images ? images[activeImageIndex] : null;
  const hasDiscount = !!item.discountPrice && item.discountPrice < item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        discountPrice: item.discountPrice,
        image: activeImage
          ? activeImage.optimizeUrl || activeImage.url
          : "https://via.placeholder.com/300x400",
      });
    }
    onClose();
  };

  const descriptionParagraphs = item.description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div
      className={styles.modal}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        &times;
      </button>

      <div className={styles.content}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <img
                src={
                  activeImage
                    ? activeImage.optimizeUrl || activeImage.url
                    : (profile as string)
                }
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profile as string;
                }}
              />
            </div>

            {images && images.length > 1 && (
              <div className={styles.thumbnailRow}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.thumbnail} ${
                      idx === activeImageIndex ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img.optimizeUrl || img.url}
                      alt={`${item.name} thumbnail ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = profile as string;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.categoryTab}>{item.category}</span>
            <h2 className={styles.title}>{item.name}</h2>

            <div className={styles.priceRow}>
              {hasDiscount ? (
                <>
                  <span className={styles.oldPrice}>Rs. {item.price}</span>
                  <span className={styles.currentPrice}>
                    Rs. {item.discountPrice}
                  </span>
                  <span className={styles.discountBadge}>
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className={styles.currentPrice}>Rs. {item.price}</span>
              )}
            </div>
            <p className={styles.shippingNote}>
              Shipping is calculated at checkout
            </p>

            <div className={styles.quantityRow}>
              <div className={styles.quantitySelector}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                Add To Cart
              </button>
            </div>

            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "details" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "reviews" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "details" ? (
                descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))
                ) : (
                  <p>No description available.</p>
                )
              ) : (
                <p className={styles.noReviews}>
                  No reviews yet. Be the first to review this product.
                </p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  // Escape key + body scroll lock while open. This effect only touches the
  // DOM/document (an external system), not component state, so it's fine here.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* key={item._id} makes React remount this on product change, so
          quantity/activeImageIndex/activeTab reset for free — no effect needed. */}
      <ProductDetailContent key={item._id} item={item} onClose={onClose} />
    </div>
  );
};

export default ProductDetailModal;