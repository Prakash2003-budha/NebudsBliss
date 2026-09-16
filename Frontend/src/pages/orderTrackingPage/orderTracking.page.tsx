import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../components/layout/layout";
import { API_ENDPOINTS } from "../../config/api";
import styles from "./orderTracking.page.module.scss";

interface TrackedOrder {
  fullName: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
}

const OrderTrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(API_ENDPOINTS.TRACK_ORDER(token))
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Tracking link is invalid.");
        setOrder(result.data);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load your order.");
      });
  }, [token]);

  return (
    <Layout>
      <section className={styles.container}>
        {error ? (
          <>
            <h1>Unable to find order</h1>
            <p>{error}</p>
          </>
        ) : !order ? (
          <p>Loading your order...</p>
        ) : (
          <>
            <p className={styles.eyebrow}>Order tracking</p>
            <h1>Thanks for your order, {order.fullName}</h1>
            <p className={styles.status}>Status: {order.orderStatus}</p>
            <div className={styles.items}>
              {order.items.map((item) => (
                <div key={item.name} className={styles.item}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <p className={styles.total}>Total: Rs. {order.totalAmount.toLocaleString()}</p>
          </>
        )}
        <Link to="/" className={styles.link}>Back to home</Link>
      </section>
    </Layout>
  );
};

export default OrderTrackingPage;
