import React from "react";
import Layout from "../../components/layout/layout";
import styles from "./home.page.module.scss";

// Temporary mock data so you can see the design in action!
const CATEGORIES = ["Powerbank", "Camera", "Earbuds", "Charger", "Fan"];
const FEATURED_PRODUCTS = [
  { id: 1, name: "Vanilla Bean Cloud Cake", price: "Rs. 1200", img: "https://via.placeholder.com/300x400" },
  { id: 2, name: "Artisan Sourdough", price: "Rs. 350", img: "https://via.placeholder.com/300x400" },
  { id: 3, name: "Butter Croissant", price: "Rs. 180", img: "https://via.placeholder.com/300x400" },
  { id: 4, name: "Matcha Macarons", price: "Rs. 450", img: "https://via.placeholder.com/300x400" },
];

const Homepage: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        
        <section className={styles.PosterSection}>
          <div className={styles.heroContent}>
            <h1>Poster Will be displayd in here</h1>
            <button className={styles.heroBtn}>Shop Now</button>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <h2>Shop by Category</h2>
          </div>
          <div className={styles.categoryList}>
            {CATEGORIES.map((cat, index) => (
              <div key={index} className={styles.categoryPill}>
                {cat}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2>Featured Treats</h2>
          </div>
          <div className={styles.productGrid}>
            {FEATURED_PRODUCTS.map((item) => (
              <div key={item.id} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  <img src={item.img} alt={item.name} />
                </div>
                <div className={styles.cardDetails}>
                  <h3>{item.name}</h3>
                  <p className={styles.price}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Homepage;