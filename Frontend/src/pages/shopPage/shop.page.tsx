import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import ProductCard, { type Item } from "../../components/productCard/ProductCard";
import ProductDetailModal from "../../components/productDetailModal/ProductDetailModel";
import PasswordConfirmModal from "../../components/passwordAsking/PasswordConfirmModal";
import Pagination from "../../components/pagination/Pagination";
import FilterSidebar, {
  type SortOption,
  type StockOption,
  type AvailabilityState,
} from "../../components/filterSidebar/FilterSidebar";
import { API_ENDPOINTS, CATEGORY_SLUG_MAP } from "../../constants/constants";
import { useCart } from "../../context/userCart";
import { toast } from "react-toastify";
import styles from "./shop.page.module.scss";

const PAGE_SIZE = 12;

const CATEGORY_LINKS = Object.entries(CATEGORY_SLUG_MAP).map(([slug, label]) => ({
  slug,
  label,
}));

interface User {
  role: string;
  [key: string]: unknown;
}

interface ItemsResponse {
  data: Item[];
  option: { page: number; limit: number; total: number; totalPages: number } | null;
}

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [currentTime] = useState(() => Date.now());

  const [items, setItems] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [stockFilter, setStockFilter] = useState<StockOption>("all");
  const [availability, setAvailability] = useState<AvailabilityState>({
    onSale: false,
    isNew: false,
  });
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = user?.role === "Admin";

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const categoryValues = selectedCategorySlugs
      .map((slug) => CATEGORY_SLUG_MAP[slug])
      .filter(Boolean);

    const params: Record<string, string | number> = {
      isActive: "true",
      page: currentPage,
      limit: PAGE_SIZE,
    };

    if (categoryValues.length > 0) params.category = categoryValues.join(",");
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;
    if (sortBy === "priceLow" || sortBy === "priceHigh" || sortBy === "oldest" || sortBy === "newest") {
      params.sortBy = sortBy;
    }

    axios
      .get<ItemsResponse>(API_ENDPOINTS.GET_ALL_ITEMS, { params, signal: controller.signal })
      .then((res) => {
        const fetched = res.data.data || [];
        setItems(fetched);
        setTotalPages(res.data.option?.totalPages || 1);
        setTotalItems(res.data.option?.total || fetched.length);
        setAvailableBrands((prev) => {
          const brandsOnPage = Array.from(
            new Set(fetched.map((item) => item.brand).filter((b): b is string => !!b))
          );
          const merged = Array.from(new Set([...prev, ...brandsOnPage])).sort();
          return merged;
        });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError("Failed to load products. Please try again later.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [currentPage, selectedCategorySlugs, selectedBrands, priceRange, sortBy]);

  const visibleItems = useMemo(() => {
    let result = [...items];
    const NEW_WINDOW_DAYS = 21;
    const cutoff = currentTime - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    if (stockFilter === "in") {
      result = result.filter((item) => (item.stockQuantity ?? 1) > 0);
    } else if (stockFilter === "out") {
      result = result.filter((item) => (item.stockQuantity ?? 1) <= 0);
    }

    if (availability.onSale) {
      result = result.filter((item) => !!item.discountPrice && item.discountPrice < item.price);
    }

    if (availability.isNew) {
      result = result.filter(
        (item) => item.createdAt && new Date(item.createdAt).getTime() >= cutoff
      );
    }

    return result;
  }, [items, stockFilter, availability, currentTime]);

  const toggleCategory = (slug: string) => {
    setSelectedCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const handlePriceRangeChange = (range: { min: string; max: string }) => {
    setPriceRange(range);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSortBy("newest");
    setStockFilter("all");
    setAvailability({ onSale: false, isNew: false });
    setSelectedCategorySlugs([]);
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setPage(1);
  };

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
      setTotalItems((prev) => Math.max(prev - 1, 0));
    } catch {
      toast.error(`Failed to delete "${itemPendingDelete.name}". Please try again.`);
    } finally {
      setDeletingId(null);
      setItemPendingDelete(null);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Shop</h1>
          <p>
            {loading
              ? "Loading products..."
              : `${totalItems} product${totalItems === 1 ? "" : "s"} available`}
          </p>
        </div>

        <div className={styles.layout}>
          <FilterSidebar
            sortBy={sortBy}
            onSortChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            stockFilter={stockFilter}
            onStockChange={setStockFilter}
            availability={availability}
            onAvailabilityChange={(key) =>
              setAvailability((prev) => ({ ...prev, [key]: !prev[key] }))
            }
            categories={CATEGORY_LINKS}
            selectedCategorySlugs={selectedCategorySlugs}
            onCategoryToggle={toggleCategory}
            brands={availableBrands}
            selectedBrands={selectedBrands}
            onBrandToggle={toggleBrand}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            onClearFilters={handleClearFilters}
          />

          <div className={styles.content}>
            {loading && <div className={styles.stateMessage}>Loading products...</div>}

            {!loading && error && <div className={styles.stateMessage}>{error}</div>}

            {!loading && !error && items.length === 0 && (
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

            {!loading && !error && items.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
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

export default ShopPage;
