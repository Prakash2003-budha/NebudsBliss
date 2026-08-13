import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import shared from "./admin.shared.module.scss";
import styles from "./AdminOrders.module.scss";
import ConfirmDialog from "./ConfirmDialog";

interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  note?: string;
  mapUrl?: string;
  items?: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  promoCode?: string;
  discount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentScreenshot?: { url?: string; public_id?: string };
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

type OrderStatusFilter = "all" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatusFilter = "all" | "pending" | "completed" | "failed";

const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  processing: { label: "Processing", className: shared.badgeViolet },
  shipped: { label: "Shipped", className: shared.badgeCyan },
  delivered: { label: "Delivered", className: shared.badgeGreen },
  cancelled: { label: "Cancelled", className: shared.badgeRed },
};

const PAYMENT_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: shared.badgeAmber },
  completed: { label: "Completed", className: shared.badgeGreen },
  failed: { label: "Failed", className: shared.badgeRed },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Cash on delivery",
  bank: "Bank transfer",
};

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

const formatPrice = (value?: number): string => {
  const n = Number(value ?? 0);
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const shortId = (id?: string): string => {
  if (!id) return "-";
  return id.length > 10 ? `#${id.slice(-6).toUpperCase()}` : `#${id.toUpperCase()}`;
};

const formatDate = (value?: string): string => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string): string => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [payFilter, setPayFilter] = useState<PaymentStatusFilter>("all");

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [lightboxOrder, setLightboxOrder] = useState<Order | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.GET_ALL_ORDERS, { headers: authHeaders() });
      setOrders(res.data?.data ?? []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matches the established admin data-loading pattern
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (order: Order, orderStatus: string) => {
    const previous = order.orderStatus;
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, orderStatus } : o)));
    if (detailOrder?._id === order._id) setDetailOrder((prev) => (prev ? { ...prev, orderStatus } : prev));
    setSavingId(order._id);
    try {
      await axios.patch(API_ENDPOINTS.UPDATE_ORDER(order._id), { orderStatus }, { headers: authHeaders() });
      toast.success(`Order ${shortId(order._id)} marked as "${orderStatus}".`);
    } catch (error) {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, orderStatus: previous } : o)));
      if (detailOrder?._id === order._id)
        setDetailOrder((prev) => (prev ? { ...prev, orderStatus: previous } : prev));
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setSavingId(null);
    }
  };

  const updatePaymentStatus = async (order: Order, paymentStatus: string) => {
    const previous = order.paymentStatus;
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, paymentStatus } : o)));
    if (detailOrder?._id === order._id)
      setDetailOrder((prev) => (prev ? { ...prev, paymentStatus } : prev));
    setSavingId(order._id);
    try {
      await axios.patch(API_ENDPOINTS.UPDATE_ORDER(order._id), { paymentStatus }, { headers: authHeaders() });
      toast.success(`Payment for ${shortId(order._id)} marked as "${paymentStatus}".`);
    } catch (error) {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, paymentStatus: previous } : o)));
      if (detailOrder?._id === order._id)
        setDetailOrder((prev) => (prev ? { ...prev, paymentStatus: previous } : prev));
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status.");
    } finally {
      setSavingId(null);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.DELETE_ORDER(deleteTarget._id), { headers: authHeaders() });
      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      if (detailOrder?._id === deleteTarget._id) setDetailOrder(null);
      toast.success(`Order ${shortId(deleteTarget._id)} deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => (statusFilter === "all" ? true : o.orderStatus === statusFilter))
      .filter((o) => (payFilter === "all" ? true : o.paymentStatus === payFilter))
      .filter((o) => {
        if (!q) return true;
        return [
          o._id,
          o.fullName,
          o.phone,
          o.email,
          o.address,
          o.city,
          o.paymentMethod,
          o.paymentStatus,
          o.orderStatus,
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
  }, [orders, search, statusFilter, payFilter]);

  const countFor = (key: OrderStatusFilter) =>
    key === "all" ? orders.length : orders.filter((o) => o.orderStatus === key).length;

  const proofUrl = (o: Order) => o.paymentScreenshot?.url || "";

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Orders</h1>
          <p className={shared.pageSubtitle}>
            Track, verify and manage every order placed on the store.
          </p>
        </div>
        <div className={shared.toolbar}>
          <button className={`${shared.btn} ${shared.btnNeutral}`} onClick={loadOrders}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={shared.searchBox}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by id, customer, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={shared.select}
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value as PaymentStatusFilter)}
          style={{ width: 190 }}
        >
          <option value="all">All payment statuses</option>
          <option value="pending">Payment pending</option>
          <option value="completed">Payment completed</option>
          <option value="failed">Payment failed</option>
        </select>
      </div>

      <div className={styles.filterTabs} style={{ marginTop: "0.9rem" }}>
        {(["all", "processing", "shipped", "delivered", "cancelled"] as OrderStatusFilter[]).map(
          (key) => (
            <button
              key={key}
              className={`${styles.filterTab} ${statusFilter === key ? styles.filterTabActive : ""}`}
              onClick={() => setStatusFilter(key)}
            >
              {key === "all" ? "All" : ORDER_STATUS_META[key].label}
              <span className={styles.filterCount}>{countFor(key)}</span>
            </button>
          )
        )}
      </div>

      <div className={shared.card}>
        <div className={shared.cardBodyFlush}>
          {loading ? (
            <div className={shared.loading}>
              <span className={shared.spinner} />
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={shared.emptyState}>
              <div className={shared.emptyIcon}>🧾</div>
              <div className={shared.emptyTitle}>No orders found</div>
              <p className={shared.emptyText}>
                {orders.length === 0
                  ? "No orders have been placed yet. New customer orders will appear here automatically."
                  : "No orders match the current search or filters."}
              </p>
            </div>
          ) : (
            <div className={shared.tableWrapper}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Proof</th>
                    <th>Payment status</th>
                    <th>Order status</th>
                    <th className={shared.right}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const payMeta = PAYMENT_STATUS_META[order.paymentStatus ?? ""] || {
                      label: order.paymentStatus || "-",
                      className: shared.badgeGray,
                    };
                    const statusMeta = ORDER_STATUS_META[order.orderStatus ?? ""] || {
                      label: order.orderStatus || "-",
                      className: shared.badgeGray,
                    };
                    const url = proofUrl(order);
                    return (
                      <tr key={order._id}>
                        <td>
                          <span className={shared.cellMain}>{shortId(order._id)}</span>
                          <div className={shared.cellSub}>{formatDate(order.createdAt)}</div>
                        </td>
                        <td>
                          <span className={shared.cellMain}>{order.fullName || "Guest"}</span>
                          <div className={shared.cellSub}>
                            {order.phone || ""}
                            {order.city ? ` · ${order.city}` : ""}
                          </div>
                        </td>
                        <td>
                          <span className={shared.cellMain}>
                            {Array.isArray(order.items)
                              ? order.items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
                              : 0}{" "}
                            items
                          </span>
                        </td>
                        <td>
                          <span className={shared.cellMain}>
                            {PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] || order.paymentMethod || "-"}
                          </span>
                        </td>
                        <td>
                          {url ? (
                            <img
                              src={url}
                              alt="Payment proof"
                              className={styles.proofThumb}
                              onClick={() => setLightboxOrder(order)}
                            />
                          ) : (
                            <span
                              className={shared.badge}
                              style={{ background: "#f1f5f9", color: "#64748b" }}
                            >
                              No proof
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`${shared.badge} ${payMeta.className}`}>
                            {payMeta.label}
                          </span>
                        </td>
                        <td>
                          <span className={`${shared.badge} ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className={`${shared.cellMain} ${shared.right}`}>
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className={shared.right}>
                          <button
                            className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
                            onClick={() => setDetailOrder(order)}
                          >
                            View
                          </button>
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

      {/* Order detail modal */}
      {detailOrder && (
        <div className={shared.modalOverlay} onClick={() => setDetailOrder(null)}>
          <div className={shared.modal} onClick={(e) => e.stopPropagation()}>
            <div className={shared.modalHeader}>
              <h3 className={shared.modalTitle}>
                Order {shortId(detailOrder._id)}{" "}
                <span className={shared.muted} style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  · {formatDateTime(detailOrder.createdAt)}
                </span>
              </h3>
              <button className={shared.modalClose} onClick={() => setDetailOrder(null)}>
                ×
              </button>
            </div>

            <div className={shared.modalBody}>
              <div className={styles.detailGrid}>
                <div>
                  <h4 className={styles.sectionTitle}>Customer</h4>
                  <p className={styles.metaLine}>
                    <span className={styles.metaLabel}>Name</span>
                    {detailOrder.fullName || "-"}
                  </p>
                  <p className={styles.metaLine}>
                    <span className={styles.metaLabel}>Phone</span>
                    {detailOrder.phone || "-"}
                  </p>
                  <p className={styles.metaLine}>
                    <span className={styles.metaLabel}>Email</span>
                    {detailOrder.email || "-"}
                  </p>
                  <p className={styles.metaLine}>
                    <span className={styles.metaLabel}>Address</span>
                    {detailOrder.address || "-"}
                    {detailOrder.city ? `, ${detailOrder.city}` : ""}
                  </p>
                  {detailOrder.note && (
                    <p className={styles.metaLine}>
                      <span className={styles.metaLabel}>Note</span>
                      {detailOrder.note}
                    </p>
                  )}
                  {detailOrder.mapUrl && (
                    <p className={styles.metaLine}>
                      <span className={styles.metaLabel}>Map link</span>
                      <a href={detailOrder.mapUrl} target="_blank" rel="noreferrer">
                        Open location
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <h4 className={styles.sectionTitle}>Items</h4>
                  <ul className={styles.itemsList}>
                    {(Array.isArray(detailOrder.items) ? detailOrder.items : []).map((item, idx) => (
                      <li key={idx} className={styles.itemRow}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>
                          {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.totalsRow}>
                    <span>Subtotal</span>
                    <span>{formatPrice(detailOrder.subtotal)}</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span>Shipping</span>
                    <span>{formatPrice(detailOrder.shippingFee)}</span>
                  </div>
                  {Number(detailOrder.discount) > 0 && (
                    <div className={`${styles.totalsRow} ${styles.discountRow}`}>
                      <span>
                        {detailOrder.promoCode ? `Promo (${detailOrder.promoCode})` : "Discount"}
                      </span>
                      <span>− {formatPrice(detailOrder.discount)}</span>
                    </div>
                  )}
                  <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
                    <span>Total</span>
                    <span>{formatPrice(detailOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.statusControls}>
                <div className={styles.statusField}>
                  <label htmlFor="orderStatusSelect">Order status</label>
                  <select
                    id="orderStatusSelect"
                    className={shared.select}
                    value={detailOrder.orderStatus || ""}
                    disabled={savingId === detailOrder._id}
                    onChange={(e) => updateOrderStatus(detailOrder, e.target.value)}
                  >
                    {Object.entries(ORDER_STATUS_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.statusField}>
                  <label htmlFor="paymentStatusSelect">Payment status</label>
                  <select
                    id="paymentStatusSelect"
                    className={shared.select}
                    value={detailOrder.paymentStatus || ""}
                    disabled={savingId === detailOrder._id}
                    onChange={(e) => updatePaymentStatus(detailOrder, e.target.value)}
                  >
                    {Object.entries(PAYMENT_STATUS_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.proofBlock}>
                <h4 className={styles.sectionTitle}>Payment proof</h4>
                {proofUrl(detailOrder) ? (
                  <img
                    src={proofUrl(detailOrder)}
                    alt="Payment proof"
                    className={styles.proofImg}
                    onClick={() => setLightboxOrder(detailOrder)}
                  />
                ) : (
                  <p className={styles.emptyProof}>
                    {detailOrder.paymentMethod === "bank"
                      ? "No payment screenshot uploaded yet."
                      : "No proof needed — cash on delivery."}
                  </p>
                )}
              </div>
            </div>

            <div className={shared.modalFooter}>
              <button
                className={`${shared.btn} ${shared.btnDanger}`}
                onClick={() => setDeleteTarget(detailOrder)}
              >
                Delete order
              </button>
              <button
                className={`${shared.btn} ${shared.btnNeutral}`}
                onClick={() => setDetailOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment proof lightbox */}
      {lightboxOrder && proofUrl(lightboxOrder) && (
        <div className={styles.lightbox} onClick={() => setLightboxOrder(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOrder(null)}
            aria-label="Close"
          >
            ×
          </button>
          <p className={styles.lightboxTitle}>
            Payment proof — Order {shortId(lightboxOrder._id)}
          </p>
          <img
            src={proofUrl(lightboxOrder)}
            alt="Payment proof"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
            <button
              className={`${shared.btn} ${shared.btnDanger}`}
              disabled={savingId === lightboxOrder._id}
              onClick={() => updatePaymentStatus(lightboxOrder, "failed")}
            >
              ✕ Reject
            </button>
            <button
              className={`${shared.btn} ${shared.btnPrimary}`}
              disabled={savingId === lightboxOrder._id}
              onClick={() => updatePaymentStatus(lightboxOrder, "completed")}
            >
              ✓ Verify & mark completed
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete this order?"
        message={
          deleteTarget
            ? `Order ${shortId(deleteTarget._id)} by ${
                deleteTarget.fullName || "guest"
              } for ${formatPrice(deleteTarget.totalAmount)} will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete order"
        loading={deleting}
        onConfirm={confirmDeleteOrder}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminOrders;

