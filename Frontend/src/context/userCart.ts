import { useContext } from "react";
import { CartContext } from "./Carttypes";
import type { CartContextType } from "./Carttypes";

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};