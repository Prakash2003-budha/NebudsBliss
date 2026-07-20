import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import { API_ENDPOINTS, PAYMENT_METHOD, ORDER_STATUS } from "../../constants/constants";
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
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: "cash" | "bank";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const statusStyles: Record<Order["orderStatus"], string> = {
  [ORDER_STATUS.PROCESSING]: "statusProcessing",
  [ORDER_STATUS.SHIPPED]: "statusShipped",
  [ORDER_STATUS.DELIVERED]: "statusDelivered",
  [ORDER_STATUS.CANCELLED]: "statusCancelled",
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return;
    }

    const controller = new AbortController();
    axios
      .get(API_ENDPOINTS.GET_MY_ORDERS, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      })
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError("Could not load your orders. Please try again later.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [navigate]);

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>

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
          <div className={styles.orderList}>
            {orders.map((order) => {
              const isExpanded = expandedId === order._id;
              return (
                <div key={order._id} className={styles.orderCard}>
                  <button
                    className={styles.orderSummary}
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  >
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
                      <span className={`${styles.statusBadge} ${styles[statusStyles[order.orderStatus]]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={styles.totalAmount}>Rs. {order.totalAmount}</span>
                      <span className={styles.chevron}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.orderDetail}>
                      <div className={styles.detailColumns}>
                        <div>
                          <h4>Items</h4>
                          <ul className={styles.itemsList}>
                            {order.items.map((it, idx) => (
                              <li key={idx}>
                                <span>{it.name} × {it.quantity}</span>
                                <span>Rs. {it.price * it.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <div className={styles.totalsRow}>
                            <span>Subtotal</span>
                            <span>Rs. {order.subtotal}</span>
                          </div>
                          <div className={styles.totalsRow}>
                            <span>Shipping</span>
                            <span>Rs. {order.shippingFee}</span>
                          </div>
                          <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
                            <span>Total</span>
                            <span>Rs. {order.totalAmount}</span>
                          </div>
                        </div>

                        <div>
                          <h4>Delivery Details</h4>
                          <p className={styles.metaLine}>{order.fullName} · {order.phone}</p>
                          <p className={styles.metaLine}>{order.address}, {order.city}</p>
                          {order.note && <p className={styles.metaLine}>Note: {order.note}</p>}
                          <p className={styles.metaLine}>
                            Payment: {order.paymentMethod === PAYMENT_METHOD.CASH ? "Cash on Delivery" : "Bank Transfer"}
                            {" · "}
                            <span className={styles.paymentStatus}>{order.paymentStatus}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
