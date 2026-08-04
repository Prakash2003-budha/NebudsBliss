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

const CategoryIcon: React.FC<{ slug: string }> = ({ slug }) => {
  const common = {
    width: 18,
    height: 18,
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

  selectedCategorySlugs?: string[];
  onCategoryToggle?: (slug: string) => void;

  brands?: string[];
  selectedBrands?: string[];
  onBrandToggle?: (brand: string) => void;

  // Optional price range filter
  priceRange?: { min: string; max: string };
  onPriceRangeChange?: (range: { min: string; max: string }) => void;

  onClearFilters?: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
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
  const [isOpen, setIsOpen] = React.useState(false);

  const activeFilterCount =
    (selectedCategorySlugs?.length || 0) +
    selectedBrands.length +
    (stockFilter !== "all" ? 1 : 0) +
    (availability.onSale ? 1 : 0) +
    (availability.isNew ? 1 : 0) +
    (priceRange?.min || priceRange?.max ? 1 : 0);

  return (
    <aside className={`${styles.filters} ${isOpen ? styles.filtersOpen : ""}`}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <h2 className={styles.title}>
          Filters
          {activeFilterCount > 0 && <span className={styles.countBadge}>{activeFilterCount}</span>}
        </h2>
        <span className={styles.headerRight}>
          {onClearFilters && activeFilterCount > 0 && (
            <span
              className={styles.resetLink}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onClearFilters();
                }
              }}
            >
              Reset
            </span>
          )}
          <span className={styles.chevron} aria-hidden="true">
            &#9662;
          </span>
        </span>
      </button>

      <div className={styles.body}>
      <div className={styles.section}>
        <h3>Sort by</h3>
        <div className={styles.sortList}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortOptionActive : ""}`}
              onClick={() => onSortChange(opt.value)}
              type="button"
            >
              <span className={styles.sortDot} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterRowContainer}>
        <div className={styles.section}>
          <h3>Stock</h3>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="stock"
              className={styles.hiddenControl}
              checked={stockFilter === "in"}
              onChange={() => onStockChange(stockFilter === "in" ? "all" : "in")}
            />
            <span className={styles.radioDot} />
            <span>In Stock</span>
          </label>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name="stock"
              className={styles.hiddenControl}
              checked={stockFilter === "out"}
              onChange={() => onStockChange(stockFilter === "out" ? "all" : "out")}
            />
            <span className={styles.radioDot} />
            <span>Out of Stock</span>
          </label>
        </div>

        <div className={styles.section}>
          <h3>Availability</h3>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              className={styles.hiddenControl}
              checked={availability.onSale}
              onChange={() => onAvailabilityChange("onSale")}
            />
            <span className={styles.checkBox} />
            <span>On Sale</span>
          </label>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              className={styles.hiddenControl}
              checked={availability.isNew}
              onChange={() => onAvailabilityChange("isNew")}
            />
            <span className={styles.checkBox} />
            <span>New Arrivals</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Category</h3>
        {isMultiSelectMode ? (
          <div className={styles.categoryList}>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlugs?.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  className={`${styles.categoryRow} ${isSelected ? styles.categoryRowActive : ""}`}
                  onClick={() => onCategoryToggle?.(cat.slug)}
                >
                  <span className={styles.categoryIcon}>
                    <CategoryIcon slug={cat.slug} />
                  </span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                  {isSelected && <span className={styles.categoryCheck}>&#10003;</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.categoryList}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`${styles.categoryRow} ${
                  activeCategorySlug === cat.slug ? styles.categoryRowActive : ""
                }`}
              >
                <span className={styles.categoryIcon}>
                  <CategoryIcon slug={cat.slug} />
                </span>
                <span className={styles.categoryLabel}>{cat.label}</span>
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
                  className={styles.hiddenControl}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                />
                <span className={styles.checkBox} />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {priceRange && onPriceRangeChange && (
        <div className={styles.section}>
          <h3>Price range (Rs.)</h3>
          <div className={styles.priceRangeRow}>
            <input
              type="number"
              min="0"
              placeholder="Min"
              className={styles.priceInput}
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
            />
            <span className={styles.priceRangeDash}>&ndash;</span>
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
      </div>
    </aside>
  );
};

export default FilterSidebar;
