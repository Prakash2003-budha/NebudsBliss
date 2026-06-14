import React from 'react';
import cartIcon from "../../img/icons/cart.png"; // Your imported icon

interface FloatingCartProps {
  itemCount: number;
  onClick: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ itemCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95"
      aria-label="View Shopping Cart"
    >
      {/* Cart Icon */}
      <img 
        src={cartIcon} 
        alt="Cart" 
        className="h-7 w-7 object-contain brightness-0 invert" 
        /* Note: 'brightness-0 invert' turns a black icon white. Remove if your icon is already colored */
      />

      {/* Item Count Badge (Only shows if there are items) */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCart;