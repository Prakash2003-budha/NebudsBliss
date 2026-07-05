import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./home.page.module.scss";
import axios from "axios";
import { API_ENDPOINTS, CATEGORY } from "../../constants/constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "../auth/loginPage/login.page";
import SignUpModal from "../auth/registerPage/register.page";
import PasswordConfirmModal from "../../components/passwordAsking/PasswordConfirmModal";
import ProductDetailModal from "../../components/productDetailModal/ProductDetailModel";
import { useCart } from "../../context/userCart";
import profile from "../../img/icons/profile.black.png";

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

const SkeletonGrid: React.FC = () => (
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
);

const Homepage: React.FC = () => {
  const [activeItems, setActiveItems] = useState<Item[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    CATEGORIES[0] || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // NEW: product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAdmin = user?.role === "Admin";
  const { addToCart } = useCart();

  // Used for manual refetch (poster upload/delete) outside the effect
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetchPoster = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_POSTER);
      setPosterUrl(res.data.data?.imageUrl || null);
    } catch {
      setPosterUrl(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    abortControllerRef.current = controller;

    const fetchItems = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_ALL_ITEMS, { signal });
        const allItems: Item[] = response.data.data;
        const active = allItems.filter((item) => item.isActive);
        const shuffled = [...active].sort(() => Math.random() - 0.5);
        setActiveItems(active);
        setFeaturedItems(shuffled.slice(0, 8));
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPoster = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_POSTER, { signal });
        setPosterUrl(res.data.data?.imageUrl || null);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setPosterUrl(null);
      }
    };

    fetchItems();
    fetchPoster();
    return () => {
      controller.abort();
    };
  }, []);

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(API_ENDPOINTS.UPLOAD_POSTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        withCredentials: true,
      });
      toast.success("Poster updated successfully.");
      refetchPoster();
    } catch {
      toast.error("Failed to upload poster.");
    }
  };

  const handlePosterDelete = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(API_ENDPOINTS.DELETE_POSTER, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        withCredentials: true,
      });
      toast.success("Poster removed.");
      setPosterUrl(null);
    } catch {
      toast.error("Failed to delete poster.");
    }
  };

  const handleDeleteClick = (item: Item) => {
    setItemPendingDelete(item);
    setIsPasswordModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemPendingDelete) return;

    try {
      setDeletingId(itemPendingDelete._id);
      setIsPasswordModalOpen(false);

      const accessToken = localStorage.getItem("accessToken");

      await axios.delete(API_ENDPOINTS.DELETE_ITEM(itemPendingDelete._id), {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        withCredentials: true,
      });

      toast.success(`"${itemPendingDelete.name}" deleted successfully.`);

      setFeaturedItems((prev) =>
        prev.filter((item) => item._id !== itemPendingDelete._id)
      );
      setActiveItems((prev) =>
        prev.filter((item) => item._id !== itemPendingDelete._id)
      );
    } catch {
      toast.error(`Failed to delete "${itemPendingDelete.name}". Please try again.`);
    } finally {
      setDeletingId(null);
      setItemPendingDelete(null);
    }
  };

  // NEW: open the product detail modal for a given item
  const handleOpenProduct = (item: Item) => {
    setSelectedProduct(item);
    setIsProductModalOpen(true);
  };

  const renderProductCard = (item: Item) => (
    <div
      key={item._id}
      className={styles.productCard}
      onClick={() => handleOpenProduct(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleOpenProduct(item);
      }}
    >
      <div className={styles.categoryTabContainer}>
        <span className={styles.categoryTab}>{item.category}</span>
      </div>
      <div className={styles.imageWrapper}>
        <img
          src={
            item.images && item.images.length > 0
              ? item.images[0].optimizeUrl || item.images[0].url
              : profile as string
          }
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = profile as string;
          }}
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.nameRow}>
          <h3>{item.name}</h3>
          <span className={styles.priceBadge}>
            Rs. {item.discountPrice ? item.discountPrice : item.price}
          </span>
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.cardActions}>
          <button
            className={styles.addToCartBtn}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: item._id,
                name: item.name,
                price: item.price,
                discountPrice: item.discountPrice,
                image:
                  item.images && item.images.length > 0
                    ? item.images[0].optimizeUrl || item.images[0].url
                    : "https://via.placeholder.com/300x400",
              });
            }}
          >
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
          {isAdmin && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(item);
              }}
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
  );

  return (
    <Layout>
      <div className={styles.container}>

        {/* Hero / Poster Section */}
        <section className={styles.PosterSection}>
          {posterUrl ? (
            <img src={posterUrl} alt="Store Poster" className={styles.posterImage} />
          ) : (
            <div className={styles.heroContent}>
              <h1>Poster Will be displayed here</h1>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button
                  className={styles.heroBtn}
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login / Shop Now
                </button>
                <button
                  className={styles.heroBtn}
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className={styles.posterAdminControls}>
              <input
                type="file"
                accept="image/*"
                ref={posterInputRef}
                style={{ display: "none" }}
                onChange={handlePosterUpload}
              />
              <button
                className={styles.posterUploadBtn}
                onClick={() => posterInputRef.current?.click()}
              >
                {posterUrl ? "🔄 Replace Poster" : "📤 Upload Poster"}
              </button>
              {posterUrl && (
                <button
                  className={styles.posterDeleteBtn}
                  onClick={handlePosterDelete}
                >
                  🗑 Remove Poster
                </button>
              )}
            </div>
          )}
        </section>

        <section className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <h2>Shop by Category</h2>
          </div>
          <div className={styles.categoryList}>
            {CATEGORIES.map((cat, index) => (
              <div
                key={index}
                className={`${styles.categoryPill} ${
                  selectedCategory === cat ? styles.activePill : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            {loading && <SkeletonGrid />}

            {!loading && error && (
              <div className={styles.errorWrapper}>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && selectedCategory && (
              <div className={`${styles.productGrid} ${styles.categoryGrid}`}>
                {activeItems
                  .filter((item) => item.category === selectedCategory)
                  .slice(0, 8)
                  .map((item) => renderProductCard(item))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2>Featured Products</h2>
          </div>

          {loading && <SkeletonGrid />}

          {!loading && error && (
            <div className={styles.errorWrapper}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && featuredItems.length === 0 && (
            <div className={styles.emptyWrapper}>
              <p>No products available at the moment. Check back soon!</p>
            </div>
          )}

          {!loading && !error && featuredItems.length > 0 && (
            <div className={`${styles.productGrid} ${styles.featuredGrid}`}>
              {featuredItems.map((item) => renderProductCard(item))}
            </div>
          )}
        </section>

        {/* Modals */}
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

        <PasswordConfirmModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setItemPendingDelete(null);
          }}
          onConfirm={handleDeleteConfirmed}
        />

        <ProductDetailModal
          item={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default Homepage;