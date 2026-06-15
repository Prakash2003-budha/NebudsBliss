import React, { useState } from "react";
import Header from "../header/header";
import Footer from "../footer/footer";
import styles from "./layout.module.scss"; 
import FloatingCart from "../floatingCart/floatingCart";
import AdminButton from "../adminButten/AdminButton";
import AddItemTab from "../addItemTab/addItemTab"; // Import your new tab component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // State to control if the Add Item Tab panel is visible
  const [isTabOpen, setIsTabOpen] = useState<boolean>(false);

  return (
    <div className={styles.layoutContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      <AdminButton onClick={() => setIsTabOpen(true)} />      
      
      <FloatingCart />
      
      {/* Render the drawer panel component and pass its state hooks */}
      <AddItemTab isOpen={isTabOpen} onClose={() => setIsTabOpen(false)} />
      
      <Footer />
    </div>
  );
};

export default Layout;