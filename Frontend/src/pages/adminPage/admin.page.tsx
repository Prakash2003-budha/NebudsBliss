import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Layout from "../../components/layout/layout";
import PasswordConfirmModal from "../../components/passwordAsking/PasswordConfirmModal";
import { API_ENDPOINTS, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS } from "../../constants/constants";
import styles from "./admin.page.module.scss";

interface AdminItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  images: { url: string; optimizeUrl: string }[];
}

interface AdminOrder {
  _id: string;
  fullName: string;
  phone: string;
  totalAmount: number;
  paymentMethod: "cash" | "bank";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  paymentScreenshot?: { url: string; public_id?: string };
  createdAt: string;
}

interface User {
  role: string;
  [key: string]: unknown;
}

type Tab = "items" | "orders";

const authHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return { Authorization: accessToken ? `Bearer ${accessToken}` : "" };
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("items");

  const [items, setItems] = useState<AdminItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, { price: string; stockQuantity: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<AdminItem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user: User | null = stored ? JSON.parse(stored) : null;
    if (!user || user.role !== "Admin") {
      toast.error("Admin access required.");
      navigate("/");
    }
  }, [navigate]);

  const loadItems = () => {
    axios
      .get(API_ENDPOINTS.GET_ALL_ITEMS)
      .then((res) => {
        const data: AdminItem[] = res.data.data || [];
        setItems(data);
        const initialEdits: Record<string, { price: string; stockQuantity: string }> = {};
        data.forEach((it) => {
          initialEdits[it._id] = { price: String(it.price), stockQuantity: String(it.stockQuantity) };
        });
        setEditValues(initialEdits);
      })
      .catch(() => toast.error("Failed to load items."))
      .finally(() => setItemsLoading(false));
  };

  const loadOrders = () => {
    axios
      .get(API_ENDPOINTS.GET_ALL_ORDERS, { headers: authHeaders() })
      .then((res) => setOrders(res.data.data || []))
      .catch(() => toast.error("Failed to load orders."))
      .finally(() => setOrdersLoading(false));
  };

  // loadItems/loadOrders only run once, on mount — itemsLoading/ordersLoading already
  // default to true, so there's no synchronous setState left in this effect's path.
  useEffect(() => {
    loadItems();
    loadOrders();
  }, []);

  const handleSaveItem = async (item: AdminItem) => {
    const edit = editValues[item._id];
    if (!edit) return;
    const price = parseFloat(edit.price);
    const stockQuantity = parseInt(edit.stockQuantity, 10);
    if (isNaN(price) || price < 0 || isNaN(stockQuantity) || stockQuantity < 0) {
      toast.warning("Enter a valid price and stock quantity.");
      return;
    }

    try {
      setSavingId(item._id);
      await axios.patch(
        API_ENDPOINTS.UPDATE_ITEM(item._id),
        { price, stockQuantity },
        { headers: authHeaders() }
      );
      toast.success(`"${item.name}" updated.`);
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, price, stockQuantity } : i))
      );
    } catch {
      toast.error(`Failed to update "${item.name}".`);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (item: AdminItem) => {
    try {
      setSavingId(item._id);
      await axios.patch(
        API_ENDPOINTS.UPDATE_ITEM(item._id),
        { isActive: !item.isActive },
        { headers: authHeaders() }
      );
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isActive: !i.isActive } : i))
      );
      toast.success(`"${item.name}" is now ${!item.isActive ? "visible" : "hidden"} to shoppers.`);
    } catch {
      toast.error(`Failed to update "${item.name}".`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!itemPendingDelete) return;
    try {
      setDeletingId(itemPendingDelete._id);
      setIsPasswordModalOpen(false);
      await axios.delete(API_ENDPOINTS.DELETE_ITEM(itemPendingDelete._id), {
        headers: authHeaders(),
      });
      toast.success(`"${itemPendingDelete.name}" deleted.`);
      setItems((prev) => prev.filter((i) => i._id !== itemPendingDelete._id));
    } catch {
      toast.error(`Failed to delete "${itemPendingDelete.name}".`);
    } finally {
      setDeletingId(null);
      setItemPendingDelete(null);
    }
  };

  const handleOrderStatusChange = async (order: AdminOrder, field: "orderStatus" | "paymentStatus", value: string) => {
    try {
      setUpdatingOrderId(order._id);
      await axios.patch(
        API_ENDPOINTS.UPDATE_ORDER(order._id),
        { [field]: value },
        { headers: authHeaders() }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, [field]: value } : o))
      );
      setViewingOrder((prev) =>
        prev && prev._id === order._id ? { ...prev, [field]: value } : prev
      );
      toast.success("Order updated.");
    } catch {
      toast.error("Failed to update order.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === "items" ? styles.activeTab : ""}`}
            onClick={() => setTab("items")}
          >
            Items ({items.length})
          </button>
          <button
            className={`${styles.tabBtn} ${tab === "orders" ? styles.activeTab : ""}`}
            onClick={() => setTab("orders")}
          >
            Orders ({orders.length})
          </button>
        </div>

        {tab === "items" && (
          <div className={styles.panel}>
            <p className={styles.hint}>
              Use the floating "+" button (bottom right) to add a new item. Toggle visibility, adjust
              price/stock, or delete items below.
            </p>

            {itemsLoading && <div className={styles.stateMessage}>Loading items...</div>}

            {!itemsLoading && items.length === 0 && (
              <div className={styles.stateMessage}>No items in the catalog yet.</div>
            )}

            {!itemsLoading && items.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Visible</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td className={styles.itemNameCell}>
                          <img
                            src={item.images?.[0]?.optimizeUrl || item.images?.[0]?.url}
                            alt={item.name}
                            className={styles.thumb}
                          />
                          {item.name}
                        </td>
                        <td>{item.sku}</td>
                        <td>{item.category}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={styles.miniInput}
                            value={editValues[item._id]?.price ?? ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], price: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.miniInput}
                            value={editValues[item._id]?.stockQuantity ?? ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [item._id]: { ...prev[item._id], stockQuantity: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td>
                          <button
                            className={`${styles.toggle} ${item.isActive ? styles.toggleOn : ""}`}
                            onClick={() => handleToggleActive(item)}
                            disabled={savingId === item._id}
                            aria-label={item.isActive ? "Hide item" : "Show item"}
                          >
                            <span className={styles.toggleKnob} />
                          </button>
                        </td>
                        <td className={styles.actionsCell}>
                          <button
                            className={styles.saveBtn}
                            onClick={() => handleSaveItem(item)}
                            disabled={savingId === item._id}
                          >
                            {savingId === item._id ? "Saving..." : "Save"}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => {
                              setItemPendingDelete(item);
                              setIsPasswordModalOpen(true);
                            }}
                            disabled={deletingId === item._id}
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className={styles.panel}>
            {ordersLoading && <div className={styles.stateMessage}>Loading orders...</div>}

            {!ordersLoading && orders.length === 0 && (
              <div className={styles.stateMessage}>No orders have been placed yet.</div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Payment Proof</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <div className={styles.orderIdCell}>#{order._id.slice(-8).toUpperCase()}</div>
                          <div className={styles.orderDateCell}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {order.fullName}
                          <div className={styles.orderDateCell}>{order.phone}</div>
                        </td>
                        <td>Rs. {order.totalAmount}</td>
                        <td>{order.paymentMethod === PAYMENT_METHOD.CASH ? "Cash" : "Bank"}</td>
                        <td>
                          {order.paymentMethod === PAYMENT_METHOD.BANK ? (
                            order.paymentScreenshot?.url ? (
                              <button
                                type="button"
                                className={styles.proofThumbBtn}
                                onClick={() => setViewingOrder(order)}
                              >
                                <img
                                  src={order.paymentScreenshot.url}
                                  alt={`Payment screenshot for order #${order._id.slice(-8).toUpperCase()}`}
                                  className={styles.proofThumb}
                                />
                              </button>
                            ) : (
                              <span className={styles.proofMissing}>No screenshot</span>
                            )
                          ) : (
                            <span className={styles.proofNa}>—</span>
                          )}
                        </td>
                        <td>
                          <select
                            className={styles.select}
                            value={order.paymentStatus}
                            disabled={updatingOrderId === order._id}
                            onChange={(e) =>
                              handleOrderStatusChange(order, "paymentStatus", e.target.value)
                            }
                          >
                            <option value={PAYMENT_STATUS.PENDING}>Pending</option>
                            <option value={PAYMENT_STATUS.COMPLETED}>Completed</option>
                            <option value={PAYMENT_STATUS.FAILED}>Failed</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className={styles.select}
                            value={order.orderStatus}
                            disabled={updatingOrderId === order._id}
                            onChange={(e) =>
                              handleOrderStatusChange(order, "orderStatus", e.target.value)
                            }
                          >
                            <option value={ORDER_STATUS.PROCESSING}>Processing</option>
                            <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                            <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                            <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <PasswordConfirmModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setItemPendingDelete(null);
          }}
          onConfirm={handleDeleteConfirmed}
        />

        {viewingOrder && (
          <div className={styles.lightboxOverlay} onClick={() => setViewingOrder(null)}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setViewingOrder(null)}
                aria-label="Close"
              >
                ×
              </button>

              <h3 className={styles.lightboxTitle}>
                Payment Proof — Order #{viewingOrder._id.slice(-8).toUpperCase()}
              </h3>
              <p className={styles.lightboxSubtitle}>
                {viewingOrder.fullName} · Rs. {viewingOrder.totalAmount} · Currently{" "}
                <strong>{viewingOrder.paymentStatus}</strong>
              </p>

              {viewingOrder.paymentScreenshot?.url && (
                <img
                  src={viewingOrder.paymentScreenshot.url}
                  alt="Full size payment screenshot"
                  className={styles.lightboxImage}
                />
              )}

              <div className={styles.lightboxActions}>
                <button
                  type="button"
                  className={styles.verifyBtn}
                  disabled={updatingOrderId === viewingOrder._id}
                  onClick={() => handleOrderStatusChange(viewingOrder, "paymentStatus", PAYMENT_STATUS.COMPLETED)}
                >
                  ✓ Verify Payment
                </button>
                <button
                  type="button"
                  className={styles.rejectBtn}
                  disabled={updatingOrderId === viewingOrder._id}
                  onClick={() => handleOrderStatusChange(viewingOrder, "paymentStatus", PAYMENT_STATUS.FAILED)}
                >
                  ✕ Reject Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;