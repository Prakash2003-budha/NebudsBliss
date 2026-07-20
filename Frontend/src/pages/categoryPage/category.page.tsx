import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import ProductCard, { type Item } from "../../components/productCard/ProductCard";
import ProductDetailModal from "../../components/productDetailModal/ProductDetailModel";
import PasswordConfirmModal from "../../components/passwordAsking/PasswordConfirmModal";
import { API_ENDPOINTS, CATEGORY_SLUG_MAP } from "../../constants/constants";
import { useCart } from "../../context/userCart";
import { toast } from "react-toastify";
import styles from "./category.page.module.scss";

interface User {
  role: string;
  [key: string]: unknown;
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(() => Boolean(slug && CATEGORY_SLUG_MAP[slug.toLowerCase()]));
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = user?.role === "Admin";

  const categoryName = slug ? CATEGORY_SLUG_MAP[slug.toLowerCase()] : undefined;

  useEffect(() => {
    if (!categoryName) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(API_ENDPOINTS.GET_ALL_ITEMS, {
        params: { category: categoryName, isActive: "true" },
        signal: controller.signal,
      })
      .then((res) => setItems(res.data.data || []))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError("Failed to load products. Please try again later.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [categoryName]);

  const handleOpenProduct = (item: Item) => {
    setSelectedProduct(item);
    setIsProductModalOpen(true);
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
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
        withCredentials: true,
      });

      toast.success(`"${itemPendingDelete.name}" deleted successfully.`);
      setItems((prev) => prev.filter((i) => i._id !== itemPendingDelete._id));
    } catch {
      toast.error(`Failed to delete "${itemPendingDelete.name}". Please try again.`);
    } finally {
      setDeletingId(null);
      setItemPendingDelete(null);
    }
  };

  if (!categoryName) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h2>We couldn't find that category</h2>
            <p>It may have been renamed or removed.</p>
            <Link to="/" className={styles.backLink}>
              Back to home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{categoryName}</h1>
          <p>Browse everything we currently stock in this category.</p>
        </div>

        {loading && <div className={styles.stateMessage}>Loading products...</div>}

        {!loading && error && <div className={styles.stateMessage}>{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className={styles.stateMessage}>
            No products available in {categoryName} right now. Check back soon!
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className={styles.productGrid}>
            {items.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                isAdmin={isAdmin}
                deletingId={deletingId}
                onOpenProduct={handleOpenProduct}
                onDeleteClick={handleDeleteClick}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}

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

export default CategoryPage;