import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/layout";
import { useCart } from "../../context/userCart";
import styles from "./CheckOutPage.module.scss";

interface CheckoutFormState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  payment: string;
}

const paymentOptions = [
  {
    value: "cash",
    title: "Cash on Delivery",
    description: "Pay when your order arrives at your doorstep.",
  },
  {
    value: "bank",
    title: "Bank Transfer",
    description: "Transfer the amount securely to our bank account.",
  },
];

const initialFormState: CheckoutFormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  note: "",
  payment: "cash",
};

const CheckOutPage: React.FC = () => {
  const { cartItems, changeQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CheckoutFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.discountPrice ?? item.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const shipping = cartItems.length > 0 ? 200 : 0;
  const total = subtotal + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, payment: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setSubmitted(false);
      return;
    }

    const requiredFields = [formData.fullName, formData.phone, formData.address, formData.city];
    const isComplete = requiredFields.every((field) => field.trim().length > 0);

    if (!isComplete) {
      return;
    }

    setSubmitted(true);
    clearCart();
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Secure checkout</p>
          <h1>Complete your order</h1>
          <p>Fast delivery, easy returns, and a smooth payment experience.</p>
        </div>

        <div className={styles.content}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2>Shipping details</h2>

            <div className={styles.grid}>
              <label>
                Full name
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label>
                Phone number
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  required
                />
              </label>
            </div>

            <label>
              Email address
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Delivery address
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House number, street, area"
                rows={3}
                required
              />
            </label>

            <label>
              City
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your city"
                required
              />
            </label>

            <div className={styles.paymentSection}>
              <span className={styles.paymentLabel}>Payment method</span>
              <div className={styles.paymentOptions}>
                {paymentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.paymentOption} ${
                      formData.payment === option.value ? styles.paymentOptionSelected : ""
                    }`}
                    onClick={() => handlePaymentSelect(option.value)}
                  >
                    <span className={styles.paymentTitle}>{option.title}</span>
                    <span className={styles.paymentDesc}>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <label>
              Delivery note
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Any special instructions?"
                rows={3}
              />
            </label>

            <button type="submit" className={styles.submitBtn}>
              Place order
            </button>

            {submitted && (
              <p className={styles.successMessage}>
                Thank you! Your order has been placed successfully.
              </p>
            )}
          </form>

          <aside className={styles.summaryCard}>
            <h2>Order summary</h2>

            {cartItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Your cart is empty.</p>
                <Link to="/" className={styles.linkBtn}>
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.itemList}>
                  {cartItems.map((item) => (
                    <div key={item._id} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/70x70";
                          }}
                        />
                        <div className={styles.itemContent}>
                          <strong>{item.name}</strong>
                          <p>
                            {item.quantity} × Rs. {item.discountPrice ?? item.price}
                          </p>
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        <span>
                          Rs. {((item.discountPrice ?? item.price) * item.quantity).toLocaleString()}
                        </span>
                        <div className={styles.qtyControl}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => changeQuantity(item._id, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => changeQuantity(item._id, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.totalBox}>
                  <div>
                    <span>Subtotal</span>
                    <strong>Rs. {subtotal.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <strong>Rs. {shipping.toLocaleString()}</strong>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <strong>Rs. {total.toLocaleString()}</strong>
                  </div>
                </div>

                <button type="button" className={styles.secondaryBtn} onClick={() => navigate("/")}>
                  Back to shop
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CheckOutPage;
