import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import ProductCard, { type Item } from "../../components/productCard/ProductCard";
import ProductDetailModal from "../../components/productDetailModal/ProductDetailModel";
import PasswordConfirmModal from "../../components/passwordAsking/PasswordConfirmModal";
import FilterSidebar, {
  type SortOption,
  type StockOption,
  type AvailabilityState,
} from "../../components/filterSidebar/FilterSidebar";
import { API_ENDPOINTS, CATEGORY_SLUG_MAP } from "../../constants/constants";
import { useCart } from "../../context/userCart";
import { toast } from "react-toastify";
import styles from "./category.page.module.scss";

const NEW_WINDOW_DAYS = 21;

const CATEGORY_LINKS = Object.entries(CATEGORY_SLUG_MAP).map(([slug, label]) => ({
  slug,
  label,
}));

interface User {
  role: string;
  [key: string]: unknown;
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  // Capture the current time once when the component mounts to keep the render pure
  const [currentTime] = useState(() => Date.now());

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(() => Boolean(slug && CATEGORY_SLUG_MAP[slug.toLowerCase()]));
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [stockFilter, setStockFilter] = useState<StockOption>("all");
  const [availability, setAvailability] = useState<AvailabilityState>({
    onSale: false,
    isNew: false,
  });

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
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const visibleItems = useMemo(() => {
    let result = [...items];

    if (stockFilter === "in") {
      result = result.filter((item) => (item.stockQuantity ?? 1) > 0);
    } else if (stockFilter === "out") {
      result = result.filter((item) => (item.stockQuantity ?? 1) <= 0);
    }

    if (availability.onSale) {
      result = result.filter(
        (item) => !!item.discountPrice && item.discountPrice < item.price
      );
    }

    if (availability.isNew) {
      // Use the pure currentTime state instead of Date.now()
      const cutoff = currentTime - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      result = result.filter(
        (item) => item.createdAt && new Date(item.createdAt).getTime() >= cutoff
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priceHigh":
          return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
        case "priceLow":
          return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
        case "oldest":
          return (
            new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          );
      }
    });

    return result;
  }, [items, sortBy, stockFilter, availability, currentTime]);

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

        <div className={styles.layout}>
          <FilterSidebar
            sortBy={sortBy}
            onSortChange={setSortBy}
            stockFilter={stockFilter}
            onStockChange={setStockFilter}
            availability={availability}
            onAvailabilityChange={(key) =>
              setAvailability((prev) => ({ ...prev, [key]: !prev[key] }))
            }
            categories={CATEGORY_LINKS}
            activeCategorySlug={slug?.toLowerCase()}
          />

          <div className={styles.content}>
            {loading && <div className={styles.stateMessage}>Loading products...</div>}

            {!loading && error && <div className={styles.stateMessage}>{error}</div>}

            {!loading && !error && items.length === 0 && (
              <div className={styles.stateMessage}>
                No products available in {categoryName} right now. Check back soon!
              </div>
            )}

            {!loading && !error && items.length > 0 && visibleItems.length === 0 && (
              <div className={styles.stateMessage}>
                No products match the selected filters. Try adjusting them.
              </div>
            )}

            {!loading && !error && visibleItems.length > 0 && (
              <div className={styles.productGrid}>
                {visibleItems.map((item) => (
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
          </div>
        </div>

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