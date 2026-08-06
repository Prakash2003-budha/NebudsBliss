import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import {
  API_ENDPOINTS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ORDER_STATUS,
} from "../../constants/constants";
import styles from "./orders.page.module.scss";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
  mapUrl?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  promoCode?: string;
  totalAmount: number;
  paymentMethod: "cash" | "bank";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

type OrderStatus = Order["orderStatus"];
type PaymentStatus = Order["paymentStatus"];
type StatusFilter = "all" | OrderStatus;

const ORDER_STEPS: OrderStatus[] = [
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

const STATUS_META: Record<OrderStatus, { label: string; icon: string; message: string }> = {
  [ORDER_STATUS.PROCESSING]: {
    label: "Processing",
    icon: "⏳",
    message: "We're preparing your order — sit tight!",
  },
  [ORDER_STATUS.SHIPPED]: {
    label: "Shipped",
    icon: "🚚",
    message: "Your order is on the way!",
  },
  [ORDER_STATUS.DELIVERED]: {
    label: "Delivered",
    icon: "🎉",
    message: "Delivered — enjoy your purchase!",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Cancelled",
    icon: "✕",
    message: "This order was cancelled.",
  },
};

const PAYMENT_META: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "Payment pending",
  [PAYMENT_STATUS.COMPLETED]: "Payment completed",
  [PAYMENT_STATUS.FAILED]: "Payment failed",
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: ORDER_STATUS.PROCESSING, label: "Processing" },
  { key: ORDER_STATUS.SHIPPED, label: "Shipped" },
  { key: ORDER_STATUS.DELIVERED, label: "Delivered" },
  { key: ORDER_STATUS.CANCELLED, label: "Cancelled" },
];

const statusStyles: Record<OrderStatus, string> = {
  [ORDER_STATUS.PROCESSING]: "statusProcessing",
  [ORDER_STATUS.SHIPPED]: "statusShipped",
  [ORDER_STATUS.DELIVERED]: "statusDelivered",
  [ORDER_STATUS.CANCELLED]: "statusCancelled",
};

const paymentStyles: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "paymentPending",
  [PAYMENT_STATUS.COMPLETED]: "paymentCompleted",
  [PAYMENT_STATUS.FAILED]: "paymentFailed",
};

const fmt = (n: number) => n.toLocaleString("en-US");

const filterLabel = (key: StatusFilter) =>
  key === "all" ? "orders" : `${STATUS_META[key as OrderStatus].label} orders`;

const OrderStepper: React.FC<{ status: OrderStatus }> = ({ status }) => {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className={styles.cancelledBanner}>
        <span className={styles.cancelledIcon}>{STATUS_META[status].icon}</span>
        <div className={styles.cancelledText}>
          <strong>Cancelled</strong>
          <span>{STATUS_META[status].message}</span>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(status);

  return (
    <div className={styles.stepperWrap}>
      <div className={styles.stepper}>
        {ORDER_STEPS.map((step, idx) => {
          const done = idx <= currentIndex;
          const active = done && idx === currentIndex && status !== ORDER_STATUS.DELIVERED;
          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className={`${styles.stepperLine}${done ? ` ${styles.stepperLineDone}` : ""}`} />
              )}
              <div
                className={`${styles.step}${done ? ` ${styles.stepDone}` : ""}${
                  active ? ` ${styles.stepActive}` : ""
                }`}
              >
                <div className={styles.stepDot}>{done ? "✓" : ""}</div>
                <span className={styles.stepLabel}>{STATUS_META[step].label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <p className={styles.stepperNote}>
        {STATUS_META[status].message}
        {status === ORDER_STATUS.SHIPPED && (
          <span className={styles.stepperHint}> — this updates automatically.</span>
        )}
      </p>
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const loadOrders = useCallback(
    async (silent = false) => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        if (!silent) navigate("/");
        return;
      }
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const res = await axios.get(API_ENDPOINTS.GET_MY_ORDERS, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!mountedRef.current) return;
        setOrders(res.data.data || []);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (axios.isCancel(err) || !mountedRef.current) return;
        setError("Could not load your orders. Please try again later.");
      } finally {
        fetchingRef.current = false;
        if (mountedRef.current) setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    mountedRef.current = true;
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return () => {
        mountedRef.current = false;
      };
    }

    axios
      .get(API_ENDPOINTS.GET_MY_ORDERS, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (!mountedRef.current) return;
        setOrders(res.data.data || []);
        setError(null);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (axios.isCancel(err) || !mountedRef.current) return;
        setError("Could not load your orders. Please try again later.");
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, [navigate]);

  // Auto-refresh while visible so admin status updates (e.g. shipped →
  // delivered) show up without a manual reload.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") loadOrders(true);
    };
    const interval = window.setInterval(refreshIfVisible, 30000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [loadOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
    setRefreshing(false);
  };

  const filteredOrders =
    activeFilter === "all" ? orders : orders.filter((o) => o.orderStatus === activeFilter);
  const countFor = (key: StatusFilter) =>
    key === "all" ? orders.length : orders.filter((o) => o.orderStatus === key).length;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>My Orders</h1>
            {lastUpdated && !loading && (
              <p className={styles.updatedAt}>
                Updated{" "}
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <button
            type="button"
            className={`${styles.refreshBtn}${refreshing ? ` ${styles.refreshBtnSpinning}` : ""}`}
            onClick={handleRefresh}
            aria-label="Refresh orders"
            title="Check for status updates"
          >
            ⟳
          </button>
        </div>

        {loading && <div className={styles.stateMessage}>Loading your orders...</div>}

        {!loading && error && <div className={styles.stateMessage}>{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className={styles.stateMessage}>
            You haven't placed any orders yet.
            <br />
            <Link to="/" className={styles.inlineLink}>
              Start shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <div className={styles.filterTabs} role="tablist" aria-label="Filter orders by status">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f.key}
                  className={`${styles.filterTab}${
                    activeFilter === f.key ? ` ${styles.filterTabActive}` : ""
                  }`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label}
                  <span className={styles.filterCount}>{countFor(f.key)}</span>
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className={styles.stateMessage}>No {filterLabel(activeFilter)} yet.</div>
            ) : (
              <div className={styles.orderList}>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    isExpanded={expandedId === order._id}
                    onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isExpanded, onToggle }) => {
  const status = order.orderStatus;
  return (
    <div className={styles.orderCard}>
      <button className={styles.orderSummary} onClick={onToggle}>
        <div>
          <span className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</span>
          <span className={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className={styles.summaryRight}>
          <span className={`${styles.statusBadge} ${styles[statusStyles[status]]}`}>
            {STATUS_META[status].icon} {STATUS_META[status].label}
          </span>
          <span className={styles.totalAmount}>Rs. {fmt(order.totalAmount)}</span>
          <span className={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      <OrderStepper status={status} />

      {isExpanded && (
        <div className={styles.orderDetail}>
          <div className={styles.detailColumns}>
            <div>
              <h4>Items</h4>
              <ul className={styles.itemsList}>
                {order.items.map((it, idx) => (
                  <li key={idx}>
                    <span>{it.name} × {it.quantity}</span>
                    <span>Rs. {fmt(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <span>Rs. {fmt(order.subtotal)}</span>
              </div>
              <div className={styles.totalsRow}>
                <span>Shipping</span>
                <span>Rs. {fmt(order.shippingFee)}</span>
              </div>
              {order.discount ? (
                <div className={`${styles.totalsRow} ${styles.discountRow}`}>
                  <span>Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                  <span>− Rs. {fmt(order.discount)}</span>
                </div>
              ) : null}
              <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>Rs. {fmt(order.totalAmount)}</span>
              </div>
            </div>

            <div>
              <h4>Delivery Details</h4>
              <p className={styles.metaLine}>{order.fullName} · {order.phone}</p>
              <p className={styles.metaLine}>{order.address}, {order.city}</p>
              {order.mapUrl && (
                <a href={order.mapUrl} target="_blank" rel="noreferrer" className={styles.mapLink}>
                  View location on map ↗
                </a>
              )}
              {order.note && <p className={styles.metaLine}>Note: {order.note}</p>}
              <p className={styles.metaLine}>
                Payment:{" "}
                {order.paymentMethod === PAYMENT_METHOD.CASH ? "Cash on Delivery" : "Bank Transfer"}
              </p>
              <p>
                <span className={`${styles.paymentBadge} ${styles[paymentStyles[order.paymentStatus]]}`}>
                  {PAYMENT_META[order.paymentStatus]}
                </span>
              </p>
              {status === ORDER_STATUS.CANCELLED &&
                order.paymentStatus === PAYMENT_STATUS.COMPLETED && (
                  <p className={styles.refundNote}>Your payment will be refunded shortly.</p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
