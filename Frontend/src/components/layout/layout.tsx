import React, { useState } from "react";
import Header from "../header/header";
import Footer from "../footer/footer";
import styles from "./layout.module.scss";
import FloatingCart from "../floatingCart/floatingCart";
import AdminButton from "../adminButten/AdminButton";
import AddItemTab from "../addItemTab/AddItemTab";
import CartDrawer from "../cartDrawer/CartDrawer";
import WhatsAppButton from "../whatsAppButton/whatsAppButton";
import { useCart } from "../../context/userCart";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isTabOpen, setIsTabOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { totalCount } = useCart();

  return (
    <div className={styles.layoutContainer}>
      <Header />

      <main className={styles.mainContent}>
        {children}
      </main>

      <div className={styles.floatingButtons}>
        <AdminButton onClick={() => setIsTabOpen(true)} />
        <WhatsAppButton />

        <FloatingCart
          itemCount={totalCount}
          onClick={() => setIsCartOpen(true)}
        />
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <AddItemTab isOpen={isTabOpen} onClose={() => setIsTabOpen(false)} />

      <Footer />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Layout;