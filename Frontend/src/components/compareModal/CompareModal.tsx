import React from "react";
import { createPortal } from "react-dom";
import styles from "./CompareModal.module.scss";
import type { Item } from "../productCard/ProductCard";
import { effectivePrice } from "../../utils/price";
import profile from "../../img/icons/profile.black.png";

interface CompareModalProps {
  items: Item[];
  onClose: () => void;
  onRemove: (item: Item) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ items, onClose, onRemove }) => {
  if (items.length === 0) return null;

  const rows: { label: string; get: (i: Item) => string | number }[] = [
    { label: "Price", get: (i) => `Rs. ${effectivePrice(i.price, i.discountPrice).toLocaleString()}` },
    { label: "Category", get: (i) => i.category || "N/A" },
    { label: "Brand", get: (i) => i.brand || "N/A" },
    { label: "Battery Capacity", get: (i) => (i.specs?.batteryCapacity ? `${i.specs.batteryCapacity} mAh` : "N/A") },
    { label: "Battery Type", get: (i) => i.specs?.batteryType || "N/A" },
    { label: "Bluetooth Version", get: (i) => i.specs?.bluetoothVersion || "N/A" },
    { label: "Fast Charging", get: (i) => (i.specs?.fastCharging ? "Yes" : "No") },
    { label: "Weight", get: (i) => (i.specs?.weight ? `${i.specs.weight} g` : "N/A") },
    { label: "Dimensions", get: (i) => i.specs?.dimensions || "N/A" },
    { label: "Warranty", get: (i) => (i.specs?.warrantyPeriod ? `${i.specs.warrantyPeriod} months` : "N/A") },
    { label: "Color Options", get: (i) => (i.specs?.colorOptions?.length ? i.specs.colorOptions.join(", ") : "N/A") },
    { label: "Compatibility", get: (i) => i.specs?.compatibility || "N/A" },
    { label: "In Stock", get: (i) => (i.stockQuantity && i.stockQuantity > 0 ? "Yes" : "No") },
  ];

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Compare Products</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.grid}>
          {/* Header row: product images / names */}
          <div className={styles.row}>
            <div className={styles.labelCol}>Product</div>
            {items.map((item) => {
              const image = item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || (profile as string);
              return (
                <div key={item._id} className={styles.productCol}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => onRemove(item)}
                    aria-label={`Remove ${item.name}`}
                    title="Remove"
                  >
                    &times;
                  </button>
                  <img src={image} alt={item.name} className={styles.productImage} />
                  <div className={styles.productName}>{item.name}</div>
                </div>
              );
            })}
          </div>

          {/* Spec rows */}
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <div className={styles.labelCol}>{row.label}</div>
              {items.map((item) => (
                <div key={item._id} className={styles.productCol}>
                  <span className={styles.rowValue}>{row.get(item)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CompareModal;