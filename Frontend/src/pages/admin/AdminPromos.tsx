import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import shared from "./admin.shared.module.scss";
import styles from "./AdminPromos.module.scss";
import ConfirmDialog from "./ConfirmDialog";

interface Promo {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minDiscountAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount?: number;
  usagePerUser?: number;
  validFrom?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt?: string;
}

interface PromoFormState {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minDiscountAmount: string;
  maxDiscount: string;
  maxUses: string;
  usagePerUser: string;
  validFrom: string;
  expiresAt: string;
  isActive: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

const EMPTY_FORM: PromoFormState = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minDiscountAmount: "",
  maxDiscount: "",
  maxUses: "",
  usagePerUser: "",
  validFrom: "",
  expiresAt: "",
  isActive: true,
};

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const formatPrice = (value?: number): string => {
  const n = Number(value ?? 0);
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatDateTime = (value?: string): string => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (value?: string): string => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const toIso = (value: string): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const isExpired = (p: Promo): boolean => {
  if (!p.expiresAt) return false;
  return new Date(p.expiresAt).getTime() < Date.now();
};

const isScheduled = (p: Promo): boolean => {
  if (!p.validFrom) return false;
  return new Date(p.validFrom).getTime() > Date.now();
};

const statusMeta = (p: Promo): { label: string; className: string } => {
  if (p.isActive === false) return { label: "Disabled", className: shared.badgeRed };
  if (isExpired(p)) return { label: "Expired", className: shared.badgeAmber };
  if (isScheduled(p)) return { label: "Scheduled", className: shared.badgeViolet };
  return { label: "Active", className: shared.badgeGreen };
};

const discountLabel = (p: Promo): string =>
  p.discountType === "percent" ? `${p.discountValue}%` : formatPrice(p.discountValue);

const usageLabel = (p: Promo): string => {
  const used = p.usedCount ?? 0;
  if (!p.maxUses || p.maxUses === 0) return `${used} used · unlimited`;
  return `${used} / ${p.maxUses} used`;
};

const AdminPromos: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState<PromoFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.GET_PROMO_CODES, { headers: authHeaders() });
      setPromos(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load promo codes:", error);
      toast.error("Failed to load promo codes. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matches the established admin data-loading pattern (see AdminOrders)
    loadPromos();
  }, [loadPromos]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (promo: Promo) => {
    setEditing(promo);
    setForm({
      code: promo.code || "",
      discountType: promo.discountType || "percent",
      discountValue: promo.discountValue != null ? String(promo.discountValue) : "",
      minDiscountAmount: promo.minDiscountAmount != null ? String(promo.minDiscountAmount) : "",
      maxDiscount: promo.maxDiscount != null ? String(promo.maxDiscount) : "",
      maxUses: promo.maxUses != null ? String(promo.maxUses) : "",
      usagePerUser: promo.usagePerUser != null ? String(promo.usagePerUser) : "",
      validFrom: toDateTimeLocal(promo.validFrom),
      expiresAt: toDateTimeLocal(promo.expiresAt),
      isActive: promo.isActive !== false,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditing(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formErrors = useMemo(() => {
    const errors: string[] = [];
    if (form.code.trim().length < 2) errors.push("Code must be at least 2 characters.");
    const value = parseFloat(form.discountValue);
    if (form.discountValue === "" || isNaN(value) || value < 1)
      errors.push("Discount value must be at least 1.");
    if (form.discountType === "percent" && !isNaN(value) && value > 100)
      errors.push("Percentage discount cannot exceed 100%.");
    const numOrNull = (raw: string): number | null => {
      if (raw === "") return null;
      const n = parseFloat(raw);
      return isNaN(n) ? NaN : n;
    };
    const minOrder = numOrNull(form.minDiscountAmount);
    if (Number.isNaN(minOrder)) errors.push("Minimum order amount must be a number.");
    else if (minOrder !== null && minOrder < 0)
      errors.push("Minimum order amount cannot be negative.");
    const maxDisc = numOrNull(form.maxDiscount);
    if (Number.isNaN(maxDisc)) errors.push("Maximum discount must be a number.");
    else if (maxDisc !== null && maxDisc < 0) errors.push("Maximum discount cannot be negative.");
    const maxUses = numOrNull(form.maxUses);
    if (Number.isNaN(maxUses)) errors.push("Max uses must be a number.");
    else if (maxUses !== null && maxUses < 0) errors.push("Max uses cannot be negative.");
    const perUser = numOrNull(form.usagePerUser);
    if (Number.isNaN(perUser)) errors.push("Usage per user must be a number.");
    else if (perUser !== null && perUser < 1) errors.push("Usage per user must be at least 1.");
    if (form.validFrom && form.expiresAt && new Date(form.validFrom) > new Date(form.expiresAt))
      errors.push("Valid from must be earlier than the expiry date.");
    return errors;
  }, [form]);

  const handleSubmit = async () => {
    if (formErrors.length > 0 || submitting) return;
    setSubmitting(true);
    try {
      const toNumOrNull = (raw: string): number | null => {
        if (raw === "") return null;
        const n = Number(raw);
        return isNaN(n) ? null : n;
      };
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minDiscountAmount: toNumOrNull(form.minDiscountAmount),
        maxDiscount: toNumOrNull(form.maxDiscount),
        maxUses: toNumOrNull(form.maxUses),
        usagePerUser: toNumOrNull(form.usagePerUser),
        validFrom: toIso(form.validFrom),
        expiresAt: toIso(form.expiresAt),
        isActive: form.isActive,
      };

      if (editing) {
        await axios.patch(API_ENDPOINTS.UPDATE_PROMO_CODE(editing._id), body, {
          headers: authHeaders(),
        });
        toast.success(`Promo code "${body.code}" updated.`);
      } else {
        await axios.post(API_ENDPOINTS.CREATE_PROMO_CODE, body, { headers: authHeaders() });
        toast.success(`Promo code "${body.code}" created.`);
      }

      setFormOpen(false);
      setEditing(null);
      await loadPromos();
    } catch (error) {
      console.error("Failed to save promo code:", error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string } | undefined)?.message;
        toast.error(msg || "Failed to save promo code.");
      } else {
        toast.error("Failed to save promo code.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (promo: Promo) => {
    const next = !promo.isActive;
    setSavingId(promo._id);
    setPromos((prev) => prev.map((p) => (p._id === promo._id ? { ...p, isActive: next } : p)));
    try {
      await axios.patch(
        API_ENDPOINTS.UPDATE_PROMO_CODE(promo._id),
        { isActive: next },
        { headers: authHeaders() }
      );
      toast.success(`Promo code "${promo.code}" is now ${next ? "active" : "disabled"}.`);
    } catch (error) {
      setPromos((prev) =>
        prev.map((p) => (p._id === promo._id ? { ...p, isActive: promo.isActive } : p))
      );
      console.error("Failed to toggle promo status:", error);
      toast.error(`Failed to update "${promo.code}".`);
    } finally {
      setSavingId(null);
    }
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy the code.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.DELETE_PROMO_CODE(deleteTarget._id), {
        headers: authHeaders(),
      });
      setPromos((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success(`Promo code "${deleteTarget.code}" deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete promo code:", error);
      toast.error(`Failed to delete "${deleteTarget.code}".`);
    } finally {
      setDeleting(false);
    }
  };

  const filteredPromos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promos
      .filter((p) =>
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? p.isActive !== false
            : p.isActive === false
      )
      .filter((p) => {
        if (!q) return true;
        return [p.code, p.discountType]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [promos, search, statusFilter]);

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Promo Codes</h1>
          <p className={shared.pageSubtitle}>
            Create discount codes for orders and track how often they are redeemed.
          </p>
        </div>
        <div className={shared.toolbar}>
          <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={openCreate}>
            + New promo code
          </button>
        </div>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBody}>
          <div className={styles.filters}>
            <div className={shared.searchBox}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search by code or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterTabs}>
              {(["all", "active", "inactive"] as StatusFilter[]).map((opt) => (
                <button
                  key={opt}
                  className={statusFilter === opt ? styles.filterTabActive : styles.filterTab}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt[0].toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
            <button
              className={`${shared.btn} ${shared.btnNeutral}`}
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className={shared.card}>
        <div className={shared.cardBodyFlush}>
          {loading ? (
            <div className={shared.loading}>
              <span className={shared.spinner} />
              Loading promo codes...
            </div>
          ) : filteredPromos.length === 0 ? (
            <div className={shared.emptyState}>
              <div className={shared.emptyIcon}>🎟</div>
              <div className={shared.emptyTitle}>No promo codes found</div>
              <p className={shared.emptyText}>
                {promos.length === 0
                  ? "No promo codes yet. Create your first one with “New promo code”."
                  : "No promo codes match your filters."}
              </p>
            </div>
          ) : (
            <div className={shared.tableWrapper}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Discount</th>
                    <th>Min. order</th>
                    <th>Max discount</th>
                    <th>Usage</th>
                    <th>Valid window</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromos.map((promo) => {
                  const meta = statusMeta(promo);
                  return (
                    <tr key={promo._id}>
                      <td>
                        <div className={styles.codeCell}>
                          <strong className={shared.mono}>{promo.code}</strong>
                          <button
                            className={`${styles.copyButton} ${
                              copiedId === promo._id ? styles.copied : ""
                            }`}
                            title="Copy code"
                            aria-label={`Copy ${promo.code}`}
                            onClick={() => copyCode(promo.code, promo._id)}
                          >
                            {copiedId === promo._id ? "✓" : "⧉"}
                          </button>
                        </div>
                        {isExpired(promo) && (
                          <div className={styles.usageHint}>
                            <span className={styles.expired}>Expired</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${shared.badge} ${
                            promo.discountType === "percent"
                              ? shared.badgeViolet
                              : shared.badgeBlue
                          }`}
                        >
                          {promo.discountType === "percent" ? "Percent" : "Fixed"}
                        </span>
                      </td>
                      <td>
                        <strong>{discountLabel(promo)}</strong>
                      </td>
                      <td>{formatPrice(promo.minDiscountAmount ?? 0)}</td>
                      <td>
                        {promo.maxDiscount != null && promo.maxDiscount > 0
                          ? formatPrice(promo.maxDiscount)
                          : "—"}
                      </td>
                      <td>
                        <div className={styles.usageCell}>{usageLabel(promo)}</div>
                        {promo.usagePerUser != null && promo.usagePerUser > 1 && (
                          <div className={styles.usageHint}>max {promo.usagePerUser} / user</div>
                        )}
                      </td>
                      <td>
                        {formatDateTime(promo.validFrom)} → {formatDateTime(promo.expiresAt)}
                      </td>
                      <td>
                        <span className={`${shared.badge} ${meta.className}`}>{meta.label}</span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={`${shared.btn} ${shared.btnIcon}`}
                            title={promo.isActive === false ? "Enable" : "Disable"}
                            aria-label={promo.isActive === false ? "Enable" : "Disable"}
                            disabled={savingId === promo._id}
                            onClick={() => toggleActive(promo)}
                          >
                            {savingId === promo._id
                              ? "…"
                              : promo.isActive === false
                                ? "✕"
                                : "✓"}
                          </button>
                          <button
                            className={`${shared.btn} ${shared.btnIcon}`}
                            title="Edit"
                            aria-label={`Edit ${promo.code}`}
                            onClick={() => openEdit(promo)}
                          >
                            ✎
                          </button>
                          <button
                            className={`${shared.btn} ${shared.btnDanger}`}
                            title="Delete"
                            aria-label={`Delete ${promo.code}`}
                            onClick={() => setDeleteTarget(promo)}
                          >
                            🗑
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
              <h2>{editing ? "Edit promo code" : "New promo code"}</h2>
              <button className={shared.modalClose} onClick={closeForm} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={shared.modalBody}>
              <div className={shared.formGrid}>
                <div className={`${shared.formGroup} ${shared.formGroupFull}`}>
                  <label>Code *</label>
                  <input
                    className={`${shared.input} ${shared.mono}`}
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g. NEBUDS10"
                  />
                  <small>Customers enter this at checkout — it is stored in uppercase.</small>
                </div>

                <div className={`${styles.toggleRow} ${shared.formGroupFull}`}>
                  <div className={styles.toggleInfo}>
                    <strong>Active immediately</strong>
                    <span>Allow this code to be applied to new orders.</span>
                  </div>
                  <button
                    type="button"
                    className={shared.toggle}
                    onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    aria-label="Toggle promo active"
                  >
                    <span className={form.isActive ? shared.toggleOn : ""} />
                  </button>
                </div>

                <div className={shared.formGroup}>
                  <label>Discount type *</label>
                    <select
                      className={shared.select}
                      name="discountType"
                      value={form.discountType}
                      onChange={handleFormChange}
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed amount (Rs.)</option>
                    </select>
                  </div>
                  <div className={shared.formGroup}>
                    <label>{form.discountType === "percent" ? "Discount % *" : "Discount amount (Rs.) *"}</label>
                    <input
                      className={shared.input}
                      name="discountValue"
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.discountValue}
                      onChange={handleFormChange}
                      placeholder={form.discountType === "percent" ? "e.g. 10" : "e.g. 500"}
                    />
                  </div>

                <div className={shared.formGroup}>
                  <label>Minimum order amount (Rs.)</label>
                    <input
                      className={shared.input}
                      name="minDiscountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minDiscountAmount}
                      onChange={handleFormChange}
                      placeholder="e.g. 1500 — optional"
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Maximum discount (Rs.)</label>
                    <input
                      className={shared.input}
                      name="maxDiscount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maxDiscount}
                      onChange={handleFormChange}
                      placeholder="Cap for % codes — optional"
                    />
                  </div>

                <div className={shared.formGroup}>
                  <label>Total max uses</label>
                    <input
                      className={shared.input}
                      name="maxUses"
                      type="number"
                      min="0"
                      step="1"
                      value={form.maxUses}
                      onChange={handleFormChange}
                      placeholder="0 = unlimited"
                    />
                    <small>0 or empty means unlimited.</small>
                  </div>
                  <div className={shared.formGroup}>
                    <label>Uses per user</label>
                    <input
                      className={shared.input}
                      name="usagePerUser"
                      type="number"
                      min="1"
                      step="1"
                      value={form.usagePerUser}
                      onChange={handleFormChange}
                      placeholder="e.g. 1"
                    />
                    <small>How many orders one account can apply it to.</small>
                  </div>

                <div className={shared.formGroup}>
                  <label>Valid from</label>
                    <input
                      className={shared.input}
                      name="validFrom"
                      type="datetime-local"
                      value={form.validFrom}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={shared.formGroup}>
                    <label>Expires at</label>
                    <input
                      className={shared.input}
                      name="expiresAt"
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={handleFormChange}
                    />
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
                {submitting ? "Saving..." : editing ? "Save changes" : "Create code"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete this promo code?"
        message={
          deleteTarget
            ? `"${deleteTarget.code}" will be permanently removed. Orders that already used it are not affected.`
            : ""
        }
        confirmLabel="Delete code"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPromos;

