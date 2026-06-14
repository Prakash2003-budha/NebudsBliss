import React from "react";
import cartIcon from "../../img/icons/cart.png"; // Matches your file tree path
import styles from "./floatingCart.module.scss"; // Imports your SCSS module

interface FloatingCartProps {
  itemCount?: number;     // The '?' makes it optional so Layout doesn't break
  onClick?: () => void;   // The '?' makes it optional
}

const FloatingCart: React.FC<FloatingCartProps> = ({ 
  itemCount = 0,          // Default value if no prop is passed
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={styles.floatingCartButton}
      aria-label="View Shopping Cart"
    >
      <img 
        src={cartIcon} 
        alt="Cart" 
        className={styles.cartIcon} 
      />
      {itemCount > 0 && (
        <span className={styles.cartBadge}>
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCart;