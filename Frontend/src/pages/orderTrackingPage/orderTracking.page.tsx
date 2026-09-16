import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../components/layout/layout";
import { API_ENDPOINTS } from "../../config/api";
import styles from "./orderTracking.page.module.scss";

interface TrackedOrder {
  _id?: string;
  fullName: string;
  createdAt?: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
}

const steps = [
  { key: "processing", label: "Processing", icon: "⏳", text: "Your order is being prepared." },
  { key: "shipped", label: "Shipped", icon: "🚚", text: "Your order is on the way." },
  { key: "delivered", label: "Delivered", icon: "✓", text: "Your order has been delivered." },
];

const money = (value = 0) => `Rs. ${value.toLocaleString("en-US")}`;

const OrderTrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async (isRefresh = false) => {
    if (!token) {
      setError("This tracking link is incomplete.");
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.TRACK_ORDER(token));
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Tracking link is invalid.");
      setOrder(result.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your order.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const formatDate = (date?: string) => {
    if (!date) return "Recently placed";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const currentIndex = order ? steps.findIndex((step) => step.key === order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === "cancelled";

  return (
    <Layout>
      <main className={styles.page}>
        <section className={styles.container}>
          {loading ? (
            <div className={styles.stateCard}>
              <div className={styles.spinner} />
              <h1>Loading your order</h1>
              <p>We are fetching the latest delivery status.</p>
            </div>
          ) : error ? (
            <div className={styles.stateCard}>
              <div className={styles.errorIcon}>!</div>
              <h1>Unable to find this order</h1>
              <p>{error}</p>
              <button className={styles.primaryButton} onClick={() => void loadOrder()}>
                Try again
              </button>
            </div>
          ) : order ? (
            <>
              <div className={styles.header}>
                <div>
                  <p className={styles.eyebrow}>Order tracking</p>
                  <h1>Thanks for your order, {order.fullName}</h1>
                  <p className={styles.subtitle}>
                    Placed on {formatDate(order.createdAt)}
                    {order._id && <span> · Order #{order._id.slice(-8).toUpperCase()}</span>}
                  </p>
                </div>
                <button className={styles.refreshButton} onClick={() => void loadOrder(true)} disabled={refreshing}>
                  {refreshing ? "Refreshing..." : "↻ Refresh status"}
                </button>
              </div>

              <div className={`${styles.statusCard} ${isCancelled ? styles.cancelled : ""}`}>
                {isCancelled ? (
                  <>
                    <div className={styles.statusIcon}>×</div>
                    <div><strong>Order cancelled</strong><p>This order will not be delivered.</p></div>
                  </>
                ) : (
                  <>
                    <div className={styles.statusIcon}>{steps[currentIndex]?.icon || "⏳"}</div>
                    <div><strong>{steps[currentIndex]?.label || "Processing"}</strong><p>{steps[currentIndex]?.text}</p></div>
                  </>
                )}
              </div>

              {!isCancelled && (
                <div className={styles.stepper}>
                  {steps.map((step, index) => (
                    <React.Fragment key={step.key}>
                      {index > 0 && <div className={`${styles.stepLine} ${index <= currentIndex ? styles.stepLineDone : ""}`} />}
                      <div className={`${styles.step} ${index <= currentIndex ? styles.stepDone : ""} ${index === currentIndex ? styles.stepCurrent : ""}`}>
                        <div className={styles.stepDot}>{index <= currentIndex ? "✓" : ""}</div>
                        <span>{step.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className={styles.contentGrid}>
                <section className={styles.card}>
                  <div className={styles.cardHeading}><h2>Items in your order</h2><span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span></div>
                  <div className={styles.items}>
                    {order.items.map((item, index) => (
                      <div className={styles.item} key={`${item.name}-${index}`}>
                        <div className={styles.itemBadge}>{item.quantity}×</div>
                        <div className={styles.itemInfo}><strong>{item.name}</strong><span>{money(item.price)} each</span></div>
                        <strong>{money(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                </section>
                <aside className={styles.card}>
                  <div className={styles.cardHeading}><h2>Payment summary</h2></div>
                  <div className={styles.summaryRow}><span>Payment method</span><strong>{order.paymentMethod === "bank" ? "Bank transfer" : "Cash on delivery"}</strong></div>
                  <div className={styles.summaryRow}><span>Payment status</span><strong className={styles[`payment${order.paymentStatus}`] || ""}>{order.paymentStatus}</strong></div>
                  {order.subtotal !== undefined && <div className={styles.summaryRow}><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div>}
                  {order.shippingFee !== undefined && <div className={styles.summaryRow}><span>Shipping</span><strong>{money(order.shippingFee)}</strong></div>}
                  {!!order.discount && <div className={styles.summaryRow}><span>Discount</span><strong className={styles.discount}>− {money(order.discount)}</strong></div>}
                  <div className={styles.totalRow}><span>Total</span><strong>{money(order.totalAmount)}</strong></div>
                </aside>
              </div>
            </>
          ) : null}
          <div className={styles.actions}><Link to="/" className={styles.secondaryButton}>Continue shopping</Link><Link to="/orders" className={styles.primaryButton}>My orders</Link></div>
        </section>
      </main>
    </Layout>
  );
};

export default OrderTrackingPage;
