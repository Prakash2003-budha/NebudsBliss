import { useState, useEffect } from "react";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
}

const CART_KEY = "cart";

// Helper: read cart from localStorage
const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper: save cart to localStorage
const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const useCartStore = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

  // Keep localStorage in sync whenever cartItems changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return { cartItems, addToCart, removeFromCart, clearCart, totalCount };
};