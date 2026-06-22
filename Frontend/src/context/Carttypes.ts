import { createContext } from "react";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalCount: number;
}

export const CartContext = createContext<CartContextType | null>(null);