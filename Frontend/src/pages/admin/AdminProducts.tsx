import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import { compressImages } from "../../utils/imageCompression";
import shared from "./admin.shared.module.scss";
import styles from "./AdminProducts.module.scss";
import ConfirmDialog from "./ConfirmDialog";

interface ProductImage {
  url?: string;
  optimizeUrl?: string;
  public_id?: string;
}

interface Item {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  sku: string;
  category: string;
  brand?: string;
  stockQuantity: number;
  images?: ProductImage[];
  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  discountPercent: string;
  sku: string;
  category: string;
  brand: string;
  stockQuantity: string;
  isActive: boolean;
  isFeatured: boolean;
}

type AvailabilityFilter = "all" | "active" | "inactive";

// Matches the categories accepted by the backend Item validator.
const CATEGORIES = ["Earbuds", "PowerBank", "Camera", "Accessories", "Fan", "Electronics"];

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  discountPercent: "",
  sku: "",
  category: "",
  brand: "",
  stockQuantity: "0",
  isActive: true,
  isFeatured: false,
};

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const formatPrice = (value?: number): string => {
  const n = Number(value ?? 0);
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatDate = (value?: string): string => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const firstImage = (item: Item): string =>
  item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || "";

const AdminProducts: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState<AvailabilityFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formImages, setFormImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.GET_ALL_ITEMS, { headers: authHeaders() });
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matches the established admin data-loading pattern (see AdminOrders)
    loadItems();
  }, [loadItems]);

  // /admin/products/new is the dedicated "Add product" entry point — open the
  // create form automatically whenever we land on that route.
  useEffect(() => {
    if (location.pathname.endsWith("/admin/products/new")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- route-driven modal open (external system: URL)
      setEditing(null);
      setForm(EMPTY_FORM);
      setFormImages([]);
      setPreviews([]);
      setFormOpen(true);
    }
  }, [location.pathname]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormImages([]);
    setPreviews([]);
    setFormOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price != null ? String(item.price) : "",
      discountPrice: item.discountPrice != null ? String(item.discountPrice) : "",
      discountPercent:
        item.price > 0 && item.discountPrice != null
          ? String(Math.round(((item.price - item.discountPrice) / item.price) * 100))
          : "",
      sku: item.sku || "",
      category: item.category || "",
      brand: item.brand || "",
      stockQuantity: item.stockQuantity != null ? String(item.stockQuantity) : "0",
      isActive: item.isActive !== false,
      isFeatured: !!item.isFeatured,
    });
    setFormImages([]);
    setPreviews([]);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditing(null);
    if (location.pathname.endsWith("/admin/products/new")) {
      navigate("/admin/products");
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Discount % drives the discount price automatically.
      if (name === "discountPercent") {
        const price = parseFloat(next.price);
        const pct = parseFloat(value);
        if (!isNaN(price) && price > 0 && !isNaN(pct) && pct > 0 && pct <= 100) {
          next.discountPrice = String(Math.round((price - (price * pct) / 100) * 100) / 100);
        } else if (value === "" || (!isNaN(pct) && pct <= 0)) {
          next.discountPrice = "";
        }
      }

      // Editing the discount price directly mirrors the percentage back.
      if (name === "discountPrice") {
        const price = parseFloat(next.price);
        const dPrice = parseFloat(value);
        if (!isNaN(price) && price > 0 && !isNaN(dPrice) && dPrice > 0 && dPrice < price) {
          next.discountPercent = String(Math.round(((price - dPrice) / price) * 100));
        } else if (value === "" || (!isNaN(dPrice) && dPrice <= 0)) {
          next.discountPercent = "";
        }
      }

      return next;
    });
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    if (formImages.length + files.length > 5) {
      toast.warning("You can upload up to 5 images per product.");
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    const compressed = await compressImages(files, { maxDimension: 1600, quality: 0.82 });
    setFormImages((prev) => [...prev, ...compressed].slice(0, 5));
    setPreviews((prev) =>
      [...prev, ...compressed.map((file) => URL.createObjectURL(file))].slice(0, 5)
    );
  };

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const formErrors = useMemo(() => {
    const errors: string[] = [];
    if (form.name.trim().length < 2) errors.push("Name must be at least 2 characters.");
    if (form.description.trim().length < 10)
      errors.push("Description must be at least 10 characters.");
    const price = parseFloat(form.price);
    if (form.price === "" || isNaN(price) || price < 0)
      errors.push("Enter a valid price (0 or more).");
    if (form.sku.trim().length === 0) errors.push("SKU is required.");
    if (!form.category) errors.push("Choose a category.");
    const stock = parseInt(form.stockQuantity, 10);
    if (form.stockQuantity === "" || isNaN(stock) || stock < 0)
      errors.push("Stock cannot be negative.");
    const dPrice = form.discountPrice === "" ? null : parseFloat(form.discountPrice);
    if (dPrice !== null && (isNaN(dPrice) || dPrice < 0))
      errors.push("Discount price cannot be negative.");
    if (dPrice !== null && !isNaN(price) && price >= 0 && dPrice >= price)
      errors.push("Discount price must be lower than the regular price.");
    const dPct = form.discountPercent === "" ? null : parseFloat(form.discountPercent);
    if (dPct !== null && (isNaN(dPct) || dPct < 0 || dPct > 100))
      errors.push("Discount percentage must be between 0 and 100.");
    return errors;
  }, [form]);

  const handleSubmit = async () => {
    if (formErrors.length > 0 || submitting) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("description", form.description.trim());
      payload.append("price", form.price);
      payload.append("sku", form.sku.trim().toUpperCase());
      payload.append("category", form.category);
      payload.append("stockQuantity", form.stockQuantity);
      payload.append("isActive", String(form.isActive));
      payload.append("isFeatured", String(form.isFeatured));
      // A blank OR zero discount means "no discount" — never send 0, it would
      // make every consumer that does `discountPrice ?? price` show a free item.
      if (form.discountPrice !== "" && parseFloat(form.discountPrice) > 0)
        payload.append("discountPrice", form.discountPrice);
      if (form.discountPercent !== "" && parseFloat(form.discountPercent) > 0)
        payload.append("discountPercent", form.discountPercent);
      if (form.brand.trim() !== "") payload.append("brand", form.brand.trim());
      formImages.forEach((img) => payload.append("images", img));

      if (editing) {
        await axios.patch(API_ENDPOINTS.UPDATE_ITEM(editing._id), payload, {
          headers: authHeaders(),
        });
        toast.success(`"${form.name.trim()}" updated.`);
      } else {
        await axios.post(API_ENDPOINTS.CREATE_ITEM, payload, { headers: authHeaders() });
        toast.success(`"${form.name.trim()}" added to the catalogue.`);
      }

      setFormOpen(false);
      setEditing(null);
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      setFormImages([]);
      if (location.pathname.endsWith("/admin/products/new")) navigate("/admin/products");
      await loadItems();
    } catch (error) {
      console.error("Failed to save product:", error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string } | undefined)?.message;
        toast.error(msg || "Failed to save product.");
      } else {
        toast.error("Failed to save product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (item: Item) => {
    const next = !item.isActive;
    setSavingId(item._id);
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isActive: next } : i)));
    try {
      await axios.patch(API_ENDPOINTS.UPDATE_ITEM(item._id), { isActive: next }, { headers: authHeaders() });
      toast.success(`"${item.name}" is now ${next ? "visible" : "hidden"} in the store.`);
    } catch (error) {
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isActive: item.isActive } : i)));
      console.error("Failed to toggle product visibility:", error);
      toast.error(`Failed to update "${item.name}".`);
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.DELETE_ITEM(deleteTarget._id), { headers: authHeaders() });
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(`Failed to delete "${deleteTarget.name}".`);
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (categoryFilter === "all" ? true : i.category === categoryFilter))
      .filter((i) =>
        availFilter === "all"
          ? true
          : availFilter === "active"
          ? i.isActive !== false
          : i.isActive === false
      )
      .filter((i) => {
        if (!q) return true;
        return [i.name, i.sku, i.category, i.brand]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [items, search, categoryFilter, availFilter]);

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Products</h1>
          <p className={shared.pageSubtitle}>
            Manage the store catalogue — add, edit, hide or delete products.
          </p>
        </div>
        <div className={shared.toolbar}>
          <button className={`${shared.btn} ${shared.btnNeutral}`} onClick={loadItems}>
            🔄 Refresh
          </button>
          <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={openCreate}>
            ＋ Add product
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={shared.searchBox}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, SKU, category or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={shared.select}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 175 }}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className={shared.select}
          value={availFilter}
          onChange={(e) => setAvailFilter(e.target.value as AvailabilityFilter)}
          style={{ width: 175 }}
        >
          <option value="all">All availability</option>
          <option value="active">Active in store</option>
          <option value="inactive">Hidden</option>
        </select>
        <span className={shared.muted} style={{ fontSize: "0.82rem", marginLeft: "auto" }}>
          {filteredItems.length} of {items.length} products
        </span>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBodyFlush}>
          {loading ? (
            <div className={shared.loading}>
              <span className={shared.spinner} />
              Loading products...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={shared.emptyState}>
              <div className={shared.emptyIcon}>📦</div>
              <div className={shared.emptyTitle}>No products found</div>
              <p className={shared.emptyText}>
                {items.length === 0
                  ? "Your catalogue is empty. Click “Add product” to publish your first item."
                  : "No products match the current search or filters."}
              </p>
              {items.length === 0 && (
                <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={openCreate}>
                  ＋ Add product
                </button>
              )}
            </div>
          ) : (
            <div className={shared.tableWrapper}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Availability</th>
                    <th>Added</th>
                    <th className={shared.right}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const stock = Number(item.stockQuantity) || 0;
                    const img = firstImage(item);
                    const showDiscount =
                      item.discountPrice != null && Number(item.discountPrice) < Number(item.price);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className={styles.productCell}>
                            {img ? (
                              <img src={img} alt={item.name} className={styles.thumb} />
                            ) : (
                              <span className={styles.thumbPlaceholder}>📦</span>
                            )}
                            <div>
                              <span className={shared.cellMain}>{item.name}</span>
                              <div className={shared.cellSub}>{item.sku || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${shared.badge} ${shared.badgeGray}`}>
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <span className={styles.price}>{formatPrice(item.price)}</span>
                          {showDiscount && (
                            <span className={styles.oldPrice}>{formatPrice(item.discountPrice)}</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={
                              stock === 0 ? styles.stockOut : stock <= 5 ? styles.stockLow : ""
                            }
                          >
                            {stock} {stock === 1 ? "unit" : "units"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${shared.badge} ${
                              item.isFeatured ? shared.badgeBlue : shared.badgeGray
                            }`}
                          >
                            {item.isFeatured ? "Featured" : "Standard"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={shared.toggle}
                            onClick={() => toggleActive(item)}
                            disabled={savingId === item._id}
                            aria-label={`${item.isActive ? "Hide" : "Show"} ${item.name}`}
                          >
                            <span className={item.isActive ? shared.toggleOn : ""} />
                          </button>
                        </td>
                        <td>
                          <span className={shared.cellSub}>{formatDate(item.createdAt)}</span>
                        </td>
                        <td className={shared.right}>
                          <div className={styles.rowActions}>
                            <button
                              className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              className={`${shared.btn} ${shared.btnDanger} ${shared.btnSm}`}
                              onClick={() => setDeleteTarget(item)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className={shared.modalOverlay} onClick={closeForm}>
          <div className={shared.modal} onClick={(e) => e.stopPropagation()}>
            <div className={shared.modalHeader}>
              <h3 className={shared.modalTitle}>
                {editing ? `Edit — ${editing.name}` : "Add product"}
              </h3>
              <button className={shared.modalClose} onClick={closeForm} aria-label="Close">
                ×
              </button>
            </div>
            <div className={shared.modalBody}>
              <div className={shared.formGrid}>
                <div className={`${shared.formGroup} ${shared.formGroupFull}`}>
                  <label>Images (up to 5)</label>
                  <div className={styles.imageGrid}>
                    {previews.map((src, i) => (
                      <div key={src} className={styles.imageBox}>
                        <img src={src} alt={`Preview ${i + 1}`} />
                        <button
                          type="button"
                          className={styles.imageRemove}
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <button
                        type="button"
                        className={styles.imageAdd}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={submitting}
                      >
                        ＋<br />
                        Add image
                      </button>
                    )}
                    {editing && previews.length === 0 && (
                      <p className={shared.formHint} style={{ alignSelf: "center" }}>
                        {editing.images?.length
                          ? `${editing.images.length} existing image${
                              editing.images.length === 1 ? "" : "s"
                            } kept — upload new ones to replace them.`
                          : "No images uploaded yet."}
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImagesChange}
                    />
                  </div>
                </div>

                <div className={`${shared.formGroup} ${shared.formGroupFull}`}>
                  <label>Name *</label>
                  <input
                    className={shared.input}
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Nebuds Pro Wireless Earbuds"
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={shared.formGroup}>
                    <label>SKU *</label>
                    <input
                      className={shared.input}
                      name="sku"
                      value={form.sku}
                      onChange={handleFormChange}
                      placeholder="e.g. NB-EAR-PRO"
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Category *</label>
                    <select
                      className={shared.select}
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={shared.formGroup}>
                    <label>Price (Rs.) *</label>
                    <input
                      className={shared.input}
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleFormChange}
                      placeholder="e.g. 4999"
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Discount price (Rs.)</label>
                    <input
                      className={shared.input}
                      name="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discountPrice}
                      onChange={handleFormChange}
                      placeholder="e.g. 4249"
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Discount %</label>
                    <input
                      className={shared.input}
                      name="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={form.discountPercent}
                      onChange={handleFormChange}
                      placeholder="e.g. 15"
                    />
                    <small>Auto-calculates the discount price.</small>
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={shared.formGroup}>
                    <label>Brand</label>
                    <input
                      className={shared.input}
                      name="brand"
                      value={form.brand}
                      onChange={handleFormChange}
                      placeholder="e.g. NebudsBliss"
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Stock quantity *</label>
                    <input
                      className={shared.input}
                      name="stockQuantity"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stockQuantity}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className={`${shared.formGroup} ${shared.formGroupFull}`}>
                  <label>Description *</label>
                  <textarea
                    className={styles.textarea}
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the product in at least 10 characters..."
                    rows={4}
                  />
                </div>

                <div className={shared.formGroupFull}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <strong>Active in store</strong>
                      <span>Visible to customers on the storefront.</span>
                    </div>
                    <button
                      type="button"
                      className={shared.toggle}
                      onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                      aria-label="Toggle active in store"
                    >
                      <span className={form.isActive ? shared.toggleOn : ""} />
                    </button>
                  </div>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <strong>Featured product</strong>
                      <span>Highlight this item on the home page.</span>
                    </div>
                    <button
                      type="button"
                      className={shared.toggle}
                      onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                      aria-label="Toggle featured"
                    >
                      <span className={form.isFeatured ? shared.toggleOn : ""} />
                    </button>
                  </div>
                </div>

                {formErrors.length > 0 && (
                  <div className={shared.formGroupFull}>
                    <ul className={styles.formErrors}>
                      {formErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className={shared.modalFooter}>
              <button
                className={`${shared.btn} ${shared.btnNeutral}`}
                onClick={closeForm}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={`${shared.btn} ${shared.btnPrimary}`}
                onClick={handleSubmit}
                disabled={submitting || formErrors.length > 0}
              >
                {submitting ? "Saving..." : editing ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete this product?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed from the catalogue. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete product"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminProducts;







