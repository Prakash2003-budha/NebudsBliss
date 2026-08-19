import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import axios from "axios";
import styles from "./CartDrawer.module.scss";
import { useCart } from "../../context/userCart";
import { API_ENDPOINTS } from "../../constants/constants";
import { effectivePrice, isValidDiscount } from "../../utils/price";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// A lightweight recommended item shape for cross-selling/upselling.
interface RecommendedItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, clearCart, totalCount, addToCart } = useCart();
  const navigate = useNavigate(); // 2. Initialize the navigate function
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = effectivePrice(item.price, item.discountPrice);
    return sum + price * item.quantity;
  }, 0);

  // Cross-sell / upsell: when the cart is open with items, fetch popular
  // products from the same categories so the customer can add compatible
  // accessories or complementary items easily.
  useEffect(() => {
    if (!isOpen || cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    const controller = new AbortController();
    axios
      .get(API_ENDPOINTS.GET_ALL_ITEMS, {
        signal: controller.signal,
        params: { limit: 6, page: 1 },
      })
      .then((res) => {
        const all: any[] = res.data.data || [];
        const inCart = new Set(cartItems.map((i) => i._id));
        const recos = all
          .filter((i) => !inCart.has(i._id) && i.isActive !== false)
          .slice(0, 4)
          .map((i) => ({
            _id: i._id,
            name: i.name,
            price: i.price,
            discountPrice: isValidDiscount(i.price, i.discountPrice)
              ? i.discountPrice
              : undefined,
            image: i.images?.[0]?.optimizeUrl || i.images?.[0]?.url || "",
          }));
        setRecommendations(recos);
      })
      .catch(() => {
        /* silently ignore — recommendations are optional */
      });

    return () => controller.abort();
  }, [isOpen, cartItems]);

  const handleCheckout = () => {
    onClose(); 
    navigate("/Checkout"); 
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />

      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>

        <div className={styles.drawerHeader}>
          <h2>
            Your Cart
            {totalCount > 0 && (
              <span className={styles.countBadge}>{totalCount}</span>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            &times;
          </button>
        </div>
        {cartItems.length === 0 && (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            <p>Your cart is empty</p>
            <span>Add some products to get started!</span>
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <div className={styles.itemList}>
              {cartItems.map((item) => (
                <div key={item._id} className={styles.cartItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80";
                    }}
                  />

                  <div className={styles.itemDetails}>
                    <h4>{item.name}</h4>
                    <p className={styles.itemPrice}>
                      Rs. {effectivePrice(item.price, item.discountPrice)}
                      {isValidDiscount(item.price, item.discountPrice) && (
                        <span className={styles.originalPrice}>Rs. {item.price}</span>
                      )}
                    </p>
                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                  </div>

                  <div className={styles.itemRight}>
                    <p className={styles.itemTotal}>
                      Rs. {(effectivePrice(item.price, item.discountPrice) * item.quantity).toLocaleString()}
                    </p>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cross-sell / upsell recommendations */}
            {recommendations.length > 0 && (
              <div className={styles.recommendations}>
                <h4 className={styles.recoTitle}>Frequently Bought Together</h4>
                <div className={styles.recoList}>
                  {recommendations.map((rec) => (
                    <div key={rec._id} className={styles.recoItem}>
                      {rec.image ? (
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className={styles.recoImage}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className={styles.recoImagePlaceholder} />
                      )}
                      <div className={styles.recoInfo}>
                        <h5>{rec.name}</h5>
                        <p className={styles.recoPrice}>
                          Rs. {effectivePrice(rec.price, rec.discountPrice).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.recoAddBtn}
                        onClick={() =>
                          addToCart({
                            _id: rec._id,
                            name: rec.name,
                            price: rec.price,
                            discountPrice: rec.discountPrice,
                            image: rec.image || "",
                          })
                        }
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className={styles.drawerFooter}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmount}>Rs. {subtotal.toLocaleString()}</span>
              </div>

              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button className={styles.clearBtn} onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;