import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./home.page.module.scss";
import axios from "axios";
import { API_ENDPOINTS, CATEGORY } from "../../constants/constants";

interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
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
        const activeItems = allItems.filter((item) => item.isActive);
        const shuffled = activeItems.sort(() => Math.random() - 0.5);
        setFeaturedItems(shuffled.slice(0, 4));
      } catch (err) {
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

        {/* Hero Section */}
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

          {/* Loading Skeleton */}
          {loading && (
            <div className={styles.productGrid}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonTextShort} />
                    <div className={styles.skeletonTextShort} />
                    <div className={styles.skeletonBtn} />
                  </div>
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

          {/* Product Cards */}
          {!loading && !error && featuredItems.length > 0 && (
            <div className={styles.productGrid}>
              {featuredItems.map((item, index) => (
                <div key={item._id} className={styles.productCard}>
                  
                  {/* Category Tab (Folder style) */}
                  <div className={styles.categoryTabContainer}>
                    <span className={styles.categoryTab}>{item.category}</span>
                  </div>

                  {/* Image */}
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

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    {/* Name + Price Row */}
                    <div className={styles.nameRow}>
                      <h3>{item.name}</h3>
                      <span className={styles.priceBadge}>
                        Rs. {item.discountPrice ? item.discountPrice : item.price}
                      </span>
                    </div>

                    {/* Description */}
                    <p className={styles.description}>
                      {item.description.length > 80
                        ? item.description.substring(0, 80) + "..."
                        : item.description}
                    </p>

                    {/* Mock Tags (Matching your design screenshot) */}
                    <div className={styles.tagsContainer}>
                      <span className={styles.tag}>Tag A</span>
                      <span className={styles.tag}>Tag B</span>
                    </div>

                    {/* Add To Cart Button */}
                    <button className={styles.addToCartBtn}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={styles.cartIcon}
                      >
                        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                      </svg>
                      Add To Cart
                    </button>
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