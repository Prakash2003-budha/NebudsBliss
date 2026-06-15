import React, { useState } from "react";
import Header from "../header/header";
import Footer from "../footer/footer";
import styles from "./layout.module.scss"; 
import FloatingCart from "../floatingCart/floatingCart";
import AdminButton from "../adminButten/AdminButton";
import AddItemTab from "../addItemTab/addItemTab"; // Make sure path casing matches your files

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isTabOpen, setIsTabOpen] = useState<boolean>(false);

  return (
    <div className={styles.layoutContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      {/* Pass the state setter down to your updated Admin Button */}
      <AdminButton onClick={() => setIsTabOpen(true)} />      
      
      <FloatingCart />
      
      {/* This renders globally on top of the entire application layout */}
      <AddItemTab isOpen={isTabOpen} onClose={() => setIsTabOpen(false)} />
      
      <Footer />
    </div>
  );
};

export default Layout;