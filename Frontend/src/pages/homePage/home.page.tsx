import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./home.page.module.scss";
import axios from "axios";
import { API_ENDPOINTS, CATEGORY } from "../../constants/constants";

// Types
interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: { url: string; optimizeUrl: string }[];
  category: string;
  isActive: boolean;
}

const CATEGORIES = Object.values(CATEGORY);

const Homepage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.GET_ALL_ITEMS);
        const allItems: Item[] = response.data.data;

        // ✅ Filter only active items
        const activeItems = allItems.filter((item) => item.isActive);

        // ✅ Shuffle and pick 4 random items
        const shuffled = activeItems.sort(() => Math.random() - 0.5);
        const randomFour = shuffled.slice(0, 4);

        setFeaturedItems(randomFour);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load featured products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <Layout>
      <div className={styles.container}>

        {/* Hero / Poster Section */}
        <section className={styles.PosterSection}>
          <div className={styles.heroContent}>
            <h1>Poster Will be displayed here</h1>
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
            <h2>Featured Products</h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingWrapper}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonTextShort} />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className={styles.errorWrapper}>
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && featuredItems.length === 0 && (
            <div className={styles.emptyWrapper}>
              <p>No products available at the moment. Check back soon!</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && featuredItems.length > 0 && (
            <div className={styles.productGrid}>
              {featuredItems.map((item) => (
                <div key={item._id} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={
                        item.images && item.images.length > 0
                          ? item.images[0].optimizeUrl || item.images[0].url
                          : "https://via.placeholder.com/300x400"
                      }
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300x400";
                      }}
                    />
                  </div>
                  <div className={styles.cardDetails}>
                    <h3>{item.name}</h3>
                    <div className={styles.priceWrapper}>
                      {item.discountPrice ? (
                        <>
                          <p className={styles.discountPrice}>
                            Rs. {item.discountPrice}
                          </p>
                          <p className={styles.originalPrice}>
                            Rs. {item.price}
                          </p>
                        </>
                      ) : (
                        <p className={styles.price}>Rs. {item.price}</p>
                      )}
                    </div>
                    <span className={styles.categoryBadge}>
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
};

export default Homepage;