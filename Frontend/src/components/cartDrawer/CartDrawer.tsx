import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import styles from "./CartDrawer.module.scss";
import { useCart } from "../../context/userCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, clearCart, totalCount } = useCart();
  const navigate = useNavigate(); // 2. Initialize the navigate function

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  // 3. Create a handler function for the checkout button
  const handleCheckout = () => {
    onClose(); // Close the drawer first
    navigate("/Checkout"); // Redirect to your checkout page route
  };

  return (
    <>
      {/* Dark overlay behind the drawer */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>

        {/* Header */}
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

        {/* Empty state */}
        {cartItems.length === 0 && (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            <p>Your cart is empty</p>
            <span>Add some products to get started!</span>
          </div>
        )}

        {/* Cart Items */}
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
                      Rs. {item.discountPrice ?? item.price}
                      {item.discountPrice && (
                        <span className={styles.originalPrice}>Rs. {item.price}</span>
                      )}
                    </p>
                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                  </div>

                  <div className={styles.itemRight}>
                    <p className={styles.itemTotal}>
                      Rs. {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}
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

            {/* Footer */}
            <div className={styles.drawerFooter}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmount}>Rs. {subtotal.toLocaleString()}</span>
              </div>

              {/* 4. Attach the onClick handler to the button */}
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