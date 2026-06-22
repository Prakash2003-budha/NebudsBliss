import React, { useState } from "react";
import Header from "../header/header";
import Footer from "../footer/footer";
import styles from "./layout.module.scss"; 
import FloatingCart from "../floatingCart/floatingCart";
import AdminButton from "../adminButten/AdminButton";
import AddItemTab from "../addItemTab/AddItemTab";
import { useCart } from "../../context/CartContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isTabOpen, setIsTabOpen] = useState<boolean>(false);
  const { totalCount } = useCart();

  return (
    <div className={styles.layoutContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      <AdminButton onClick={() => setIsTabOpen(true)} />      
      
      <FloatingCart itemCount={totalCount} />
      
      <AddItemTab isOpen={isTabOpen} onClose={() => setIsTabOpen(false)} />
      
      <Footer />
    </div>
  );
};

export default Layout;