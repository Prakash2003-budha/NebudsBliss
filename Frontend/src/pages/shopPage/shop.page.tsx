import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import ProductCard, { type Item } from "../../components/productCard/ProductCard";
import ProductDetailModal from "../../components/productDetailModal/ProductDetailModel";
import CompareModal from "../../components/compareModal/CompareModal";
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

  // Spec-based filters
  const [batteryMin, setBatteryMin] = useState<string>("");
  const [bluetoothVersion, setBluetoothVersion] = useState<string>("");
  const [fastChargingOnly, setFastChargingOnly] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = user?.role === "Admin";

  // Compare feature (side-by-side, max 4)
  const [compareItems, setCompareItems] = useState<Item[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const handleCompareToggle = (item: Item) => {
    setCompareItems((prev) => {
      if (prev.some((i) => i._id === item._id)) {
        return prev.filter((i) => i._id !== item._id);
      }
      if (prev.length >= 4) {
        toast.warning("You can compare up to 4 products at once.");
        return prev;
      }
      return [...prev, item];
    });
  };

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

  const updateFilters = (page: number = 1) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }
    setSearchParams(next);
    // No scroll for filter changes
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

    // Spec-based filters
    if (batteryMin) params.batteryMin = Number(batteryMin);
    if (bluetoothVersion) params.bluetooth = bluetoothVersion;
    if (fastChargingOnly) params.fastCharging = "true";
    if (selectedColors.length > 0) params.color = selectedColors.join(",");

    if (sortBy === "priceLow" || sortBy === "priceHigh" || sortBy === "oldest" || sortBy === "newest") {
      params.sortBy = sortBy;
    }

    // Stock/availability filters are applied server-side so they stay correct
    // when combined with pagination (client-side filtering would only ever
    // affect the items fetched for the current page).
    if (stockFilter !== "all") params.stock = stockFilter;
    if (availability.onSale) params.onSale = "true";
    if (availability.isNew) params.isNew = "true";

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
  }, [currentPage, selectedCategorySlugs, selectedBrands, priceRange, sortBy, stockFilter, availability, batteryMin, bluetoothVersion, fastChargingOnly, selectedColors]);

  const toggleCategory = (slug: string) => {
    setSelectedCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    updateFilters(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    updateFilters(1);
  };

  const handlePriceRangeChange = (range: { min: string; max: string }) => {
    setPriceRange(range);
    updateFilters(1);
  };

  const handleClearFilters = () => {
    setSortBy("newest");
    setStockFilter("all");
    setAvailability({ onSale: false, isNew: false });
    setSelectedCategorySlugs([]);
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setBatteryMin("");
    setBluetoothVersion("");
    setFastChargingOnly(false);
    setSelectedColors([]);
    updateFilters(1);
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
              updateFilters(1);
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
            batteryMin={batteryMin}
            onBatteryMinChange={(v) => { setBatteryMin(v); updateFilters(1); }}
            bluetoothVersion={bluetoothVersion}
            onBluetoothChange={(v) => { setBluetoothVersion(v); updateFilters(1); }}
            fastChargingOnly={fastChargingOnly}
            onFastChargingChange={(v) => { setFastChargingOnly(v); updateFilters(1); }}
            selectedColors={selectedColors}
            onColorToggle={(c) => {
              setSelectedColors((prev) =>
                prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
              );
              updateFilters(1);
            }}
          />

          <div className={styles.content}>
            {loading && <div className={styles.stateMessage}>Loading products...</div>}

            {!loading && error && <div className={styles.stateMessage}>{error}</div>}

            {!loading && !error && items.length === 0 && (
              <div className={styles.stateMessage}>
                No products match the selected filters. Try adjusting them.
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
                    isComparing={compareItems.some((c) => c._id === item._id)}
                    onCompareToggle={handleCompareToggle}
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

        {/* Compare modal */}
        {compareModalOpen && (
          <CompareModal
            items={compareItems}
            onClose={() => setCompareModalOpen(false)}
            onRemove={handleCompareToggle}
          />
        )}

        {/* Floating compare bar */}
        {compareItems.length > 0 && (
          <div className={styles.compareBar}>
            <div className={styles.compareBarInfo}>
              <strong>{compareItems.length}</strong>
              <span>
                product{compareItems.length > 1 ? "s" : ""} selected for comparison
              </span>
            </div>
            <div className={styles.compareBarActions}>
              <button
                type="button"
                className={styles.compareBarClear}
                onClick={() => setCompareItems([])}
              >
                Clear
              </button>
              <button
                type="button"
                className={styles.compareBarCompare}
                onClick={() => setCompareModalOpen(true)}
              >
                Compare
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopPage;
