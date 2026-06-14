import React from "react";
import Header from "../header/header";
import Footer from "../footer/footer";
import styles from "./layout.module.scss"; 
import FloatingCart from "../floatingCart/floatingCart";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      {/* This will now work without props because we made them optional! */}
      <FloatingCart />
      
      <Footer />
    </div>
  );
};

export default Layout;