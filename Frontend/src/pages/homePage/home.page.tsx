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
import ProductCard, { type Item } from "../../components/productCard/ProductCard";
import HeroCarousel from "../../components/HeroCarousel/HeroCarousel";
import FeaturedPosters from "../../components/featuredPosters/FeaturedPosters";
import ProductHighlights from "../../components/productHighlights/ProductHighlights";
import BestSellerPosters from "../../components/bestSellerPosters/BestSellerPosters";
import { useCart } from "../../context/userCart";

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
  const [featuredPosterItems, setFeaturedPosterItems] = useState<Item[]>([]);
  const [newArrivalItems, setNewArrivalItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(CATEGORIES[0] || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);

  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAdmin = user?.role === "Admin";
  const { addToCart } = useCart();
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
    abortControllerRef.current = controller;

    const fetchItems = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_ALL_ITEMS, { signal: controller.signal });
        const allItems: Item[] = response.data.data;
        const active = allItems.filter((item) => item.isActive);
        setActiveItems(active);
        setFeaturedPosterItems(active.filter((item) => item.isFeatured).slice(0, 5));
        const sortedByNewest = [...active].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setNewArrivalItems(sortedByNewest.slice(0, 8));
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
        const res = await axios.get(API_ENDPOINTS.GET_POSTER, { signal: controller.signal });
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
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
        withCredentials: true,
      });
      toast.success("Poster removed.");
      setPosterUrl(null);
    } catch {
      toast.error("Failed to delete poster.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!itemPendingDelete) return;
    try {
      setDeletingId(itemPendingDelete._id);
      setIsPasswordModalOpen(false);
      const accessToken = localStorage.getItem("accessToken");

      await axios.delete(API_ENDPOINTS.DELETE_ITEM(itemPendingDelete._id), {
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
        withCredentials: true,
      });

      toast.success(`"${itemPendingDelete.name}" deleted successfully.`);
      setFeaturedPosterItems((prev) => prev.filter((item) => item._id !== itemPendingDelete._id));
      setNewArrivalItems((prev) => prev.filter((item) => item._id !== itemPendingDelete._id));
      setActiveItems((prev) => prev.filter((item) => item._id !== itemPendingDelete._id));
    } catch {
      toast.error(`Failed to delete "${itemPendingDelete.name}".`);
    } finally {
      setDeletingId(null);
      setItemPendingDelete(null);
    }
  };

  const renderProductCard = (item: Item) => (
    <div className={styles.scrollItem} key={item._id}>
      <ProductCard
        item={item}
        isAdmin={isAdmin}
        deletingId={deletingId}
        onOpenProduct={(item) => {
          setSelectedProduct(item);
          setIsProductModalOpen(true);
        }}
        onDeleteClick={(item) => {
          setItemPendingDelete(item);
          setIsPasswordModalOpen(true);
        }}
        addToCart={addToCart}
      />
    </div>
  );

  return (
    <Layout>
      <div className={styles.container}>
        
        <HeroCarousel 
          posterUrl={posterUrl}
          isAdmin={isAdmin}
          onUpload={handlePosterUpload}
          onDelete={handlePosterDelete}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onRegisterClick={() => setIsRegisterModalOpen(true)}
        />

        {!loading && !error && (
          <FeaturedPosters
            items={featuredPosterItems}
            onOpenProduct={(item) => {
              setSelectedProduct(item);
              setIsProductModalOpen(true);
            }}
          />
        )}

        {!loading && !error && (
          <ProductHighlights
            items={newArrivalItems}
            title="New Arrivals"
            onOpenProduct={(item) => {
              setSelectedProduct(item);
              setIsProductModalOpen(true);
            }}
          />
        )}

        <section className={styles.categorySection}>
          <div className={styles.sectionHeader}>
            <h2>Shop by Category</h2>
          </div>
          <div className={styles.categoryList}>
            {CATEGORIES.map((cat, index) => (
              <div
                key={index}
                className={`${styles.categoryPill} ${selectedCategory === cat ? styles.activePill : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            {!loading && !error && selectedCategory && (
              <div className={`${styles.productGrid} ${styles.categoryGrid}`}>
                {activeItems
                  .filter((item) => item.category === selectedCategory)
                  .slice(0, 8)
                  .map(renderProductCard)}
              </div>
            )}
          </div>
        </section>
        {loading && (
          <section className={styles.productSection}>
            <div className={styles.featuredHeader}>
              <h2 className={styles.italicTitle}>Our Best Sellers</h2>
            </div>
            <SkeletonGrid />
          </section>
        )}

        {!loading && error && (
          <section className={styles.productSection}>
            <div className={styles.featuredHeader}>
              <h2 className={styles.italicTitle}>Our Best Sellers</h2>
            </div>
            <div className={styles.errorWrapper}><p>{error}</p></div>
          </section>
        )}

        {!loading && !error && (
          <BestSellerPosters
            items={activeItems}
            isAdmin={isAdmin}
            onOpenProduct={(item) => {
              setSelectedProduct(item);
              setIsProductModalOpen(true);
            }}
          />
        )}

        <LoginPage isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSwitchToRegister={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); }} />
        <SignUpModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onSwitchToLogin={() => { setIsRegisterModalOpen(false); setIsLoginModalOpen(true); }} />
        <PasswordConfirmModal isOpen={isPasswordModalOpen} onClose={() => { setIsPasswordModalOpen(false); setItemPendingDelete(null); }} onConfirm={handleDeleteConfirmed} />
        <ProductDetailModal item={selectedProduct} isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
      
      </div>
    </Layout>
  );
};

export default Homepage;