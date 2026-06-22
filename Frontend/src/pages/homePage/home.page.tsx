import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./home.page.module.scss";
import axios from "axios";
import { API_ENDPOINTS, CATEGORY } from "../../constants/constants";
import { toast } from "react-toastify";

// Import both modal components
import LoginPage from "../auth/loginPage/login.page";
import SignUpModal from "../auth/registerPage/register.page";

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

interface User {
  role: string;
  token?: string;
  [key: string]: unknown;
}

const CATEGORIES = Object.values(CATEGORY);

const Homepage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Read logged-in user from localStorage (same pattern as Header)
  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAdmin = user?.role === "admin";

  // State to control which modal is open
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.GET_ALL_ITEMS);
      const allItems: Item[] = response.data.data;
      const activeItems = allItems.filter((item) => item.isActive);
      const shuffled = activeItems.sort(() => Math.random() - 0.5);
      setFeaturedItems(shuffled.slice(0, 4));
    } catch {
      setError("Failed to load featured products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (itemId: string, itemName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(itemId);
      await axios.delete(API_ENDPOINTS.DELETE_ITEM(itemId), {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      toast.success(`"${itemName}" deleted successfully.`);
      // Remove the deleted item from state without refetching
      setFeaturedItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch {
      toast.error(`Failed to delete "${itemName}". Please try again.`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>

        {/* Hero Section */}
        <section className={styles.PosterSection}>
          <div className={styles.heroContent}>
            <h1>Poster Will be displayed here</h1>

            <button className={styles.heroBtn} onClick={() => setIsLoginModalOpen(true)}>
              Login / Shop Now
            </button>
            <button className={styles.heroBtn} onClick={() => setIsRegisterModalOpen(true)}>
              Register
            </button>
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
              {featuredItems.map((item) => (
                <div key={item._id} className={styles.productCard}>

                  <div className={styles.categoryTabContainer}>
                    <span className={styles.categoryTab}>{item.category}</span>
                  </div>
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
                    <div className={styles.nameRow}>
                      <h3>{item.name}</h3>
                      <span className={styles.priceBadge}>
                        Rs. {item.discountPrice ? item.discountPrice : item.price}
                      </span>
                    </div>

                    <p className={styles.description}>
                      {item.description}
                    </p>

                    {/* Buttons Row */}
                    <div className={styles.cardActions}>
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

                      {/* Admin-only Delete Button */}
                      {isAdmin && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={deletingId === item._id}
                        >
                          {deletingId === item._id ? (
                            "Deleting..."
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={styles.deleteIcon}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Login Modal */}
        <LoginPage
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />

        <SignUpModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />

      </div>
    </Layout>
  );
};

export default Homepage;