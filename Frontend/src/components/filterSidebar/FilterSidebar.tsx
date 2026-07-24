import React from "react";
import { Link } from "react-router-dom";
import styles from "./filterSidebar.module.scss";

export type SortOption = "priceHigh" | "priceLow" | "newest" | "oldest";
export type StockOption = "all" | "in" | "out";

export interface AvailabilityState {
  onSale: boolean;
  isNew: boolean;
}

export interface CategoryLink {
  slug: string;
  label: string;
}

// Small monoline icon set so the sidebar doesn't depend on extra image assets.
const CategoryIcon: React.FC<{ slug: string }> = ({ slug }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (slug) {
    case "earbuds":
      return (
        <svg {...common}>
          <path d="M7 11v4a3 3 0 0 0 3 3h0a2 2 0 0 0 2-2v-3" />
          <path d="M7 11c0-2.8 1-6 5-6s5 3.2 5 6" />
          <circle cx="7" cy="12.5" r="2.2" />
          <circle cx="17" cy="12.5" r="2.2" />
        </svg>
      );
    case "powerbanks":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M13 7l-3 4h3l-3 4" />
        </svg>
      );
    case "cameras":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7l1.5-2.5h5L16 7" />
          <circle cx="12" cy="13.5" r="3.5" />
        </svg>
      );
    case "fans":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.6" />
          <path d="M12 10.4C10.5 7 8 6 6.5 7.5S7 12 10.4 12" />
          <path d="M13.6 12C17 13.5 18 16 16.5 17.5S12 17 12 13.6" />
          <path d="M10.4 12C7 13.5 6 16 7.5 17.5S12 17 12 13.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M4 9h16" />
        </svg>
      );
  }
};

interface FilterSidebarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  stockFilter: StockOption;
  onStockChange: (value: StockOption) => void;
  availability: AvailabilityState;
  onAvailabilityChange: (key: keyof AvailabilityState) => void;
  categories: CategoryLink[];
  activeCategorySlug?: string;

  // Shop-wide mode: when provided, categories render as toggleable checkboxes
  // (multi-select) instead of navigation links to a single category page.
  selectedCategorySlugs?: string[];
  onCategoryToggle?: (slug: string) => void;

  // Optional brand filter (shown when a brand list is supplied)
  brands?: string[];
  selectedBrands?: string[];
  onBrandToggle?: (brand: string) => void;

  // Optional price range filter
  priceRange?: { min: string; max: string };
  onPriceRangeChange?: (range: { min: string; max: string }) => void;

  onClearFilters?: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priceHigh", label: "High Price" },
  { value: "priceLow", label: "Low Price" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sortBy,
  onSortChange,
  stockFilter,
  onStockChange,
  availability,
  onAvailabilityChange,
  categories,
  activeCategorySlug,
  selectedCategorySlugs,
  onCategoryToggle,
  brands,
  selectedBrands = [],
  onBrandToggle,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}) => {
  const isMultiSelectMode = !!onCategoryToggle;
  return (
    <aside className={styles.filters}>
      <h2 className={styles.title}>Filters</h2>

      <div className={styles.section}>
        <h3>Sort By</h3>
        <div className={styles.pillGrid}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.pill} ${sortBy === opt.value ? styles.pillActive : ""}`}
              onClick={() => onSortChange(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Stock</h3>
        <label className={styles.radioRow}>
          <input
            type="radio"
            name="stock"
            checked={stockFilter === "in"}
            onChange={() => onStockChange(stockFilter === "in" ? "all" : "in")}
          />
          <span>In Stock</span>
        </label>
        <label className={styles.radioRow}>
          <input
            type="radio"
            name="stock"
            checked={stockFilter === "out"}
            onChange={() => onStockChange(stockFilter === "out" ? "all" : "out")}
          />
          <span>Out of Stock</span>
        </label>
      </div>

      <div className={styles.section}>
        <h3>Availability</h3>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={availability.onSale}
            onChange={() => onAvailabilityChange("onSale")}
          />
          <span>On Sale</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={availability.isNew}
            onChange={() => onAvailabilityChange("isNew")}
          />
          <span>New</span>
        </label>
      </div>

      <div className={styles.section}>
        <h3>Category</h3>
        {isMultiSelectMode ? (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlugs?.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  className={`${styles.categoryTile} ${isSelected ? styles.categoryTileActive : ""}`}
                  onClick={() => onCategoryToggle?.(cat.slug)}
                >
                  <span className={styles.categoryIcon}>
                    <CategoryIcon slug={cat.slug} />
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`${styles.categoryTile} ${
                  activeCategorySlug === cat.slug ? styles.categoryTileActive : ""
                }`}
              >
                <span className={styles.categoryIcon}>
                  <CategoryIcon slug={cat.slug} />
                </span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {brands && brands.length > 0 && onBrandToggle && (
        <div className={styles.section}>
          <h3>Brand</h3>
          <div className={styles.brandList}>
            {brands.map((brand) => (
              <label className={styles.checkRow} key={brand}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {priceRange && onPriceRangeChange && (
        <div className={styles.section}>
          <h3>Price Range (Rs.)</h3>
          <div className={styles.priceRangeRow}>
            <input
              type="number"
              min="0"
              placeholder="Min"
              className={styles.priceInput}
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
            />
            <span className={styles.priceRangeDash}>–</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              className={styles.priceInput}
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
            />
          </div>
        </div>
      )}

      {onClearFilters && (
        <button type="button" className={styles.clearFiltersBtn} onClick={onClearFilters}>
          Clear All Filters
        </button>
      )}
    </aside>
  );
};

export default FilterSidebar;
