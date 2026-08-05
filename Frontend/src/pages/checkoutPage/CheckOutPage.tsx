import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/layout";
import { useCart } from "../../context/userCart";
import { LocationPicker } from "../../components/LocationPicker/LocationPicker";
import { API_ENDPOINTS, PAYMENT_METHOD } from "../../constants/constants"; 
import styles from "./CheckOutPage.module.scss";
import qrBank from "../../img/qrbank/bankqr.png"
import { compressImage } from "../../utils/imageCompression";

interface CheckoutFormState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  payment: string;
  lat: number;
  lng: number;
  mapLink: string;
}

const paymentOptions = [
  {
    value: PAYMENT_METHOD.CASH,
    title: "Cash on Delivery",
    description: "Pay when your order arrives at your doorstep.",
  },
  {
    value: PAYMENT_METHOD.BANK,
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
  payment: PAYMENT_METHOD.CASH,
  lat: 27.7172, 
  lng: 85.324,
  mapLink: "", 
};

const CheckOutPage: React.FC = () => {
  const { cartItems, changeQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CheckoutFormState>(initialFormState);

  // Payment screenshot (only relevant for bank transfer)
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // API interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    // Switching back to cash drops any screenshot that was staged for a bank transfer
    if (value !== PAYMENT_METHOD.BANK) {
      clearScreenshot();
    }
  };

  const handleLocationSelect = (lat: number, lng: number, mapUrl: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      lat, 
      lng,
      mapLink: mapUrl 
    }));
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Please upload a JPG, PNG, or WEBP image of your payment screenshot.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setSubmitError("Screenshot must be smaller than 7MB.");
      return;
    }

    // Higher quality/dimension than product photos — the transaction ID and
    // amount need to stay legible for verification.
    const compressedFile = await compressImage(file, { maxDimension: 1400, quality: 0.88 });

    setSubmitError(null);
    setPaymentScreenshot(compressedFile);
    setScreenshotPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(compressedFile);
    });
  };

  const clearScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 1. Initial Validation
    if (cartItems.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    const requiredFields = [formData.fullName, formData.phone, formData.address, formData.city];
    const isComplete = requiredFields.every((field) => field.trim().length > 0);

    if (!isComplete) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    if (formData.payment === PAYMENT_METHOD.BANK && !paymentScreenshot) {
      setSubmitError("Please upload a screenshot of your bank transfer before placing the order.");
      return;
    }

    // 2. Prepare Payload as multipart/form-data so the payment screenshot can travel
    // alongside the rest of the order fields. Nested values (items, location) are
    // JSON-stringified since a multipart body can only hold flat string/file fields —
    // the backend parses them back into objects before validating.
    const orderForm = new FormData();
    orderForm.append("fullName", formData.fullName);
    orderForm.append("phone", formData.phone);
    orderForm.append("email", formData.email);
    orderForm.append("address", formData.address);
    orderForm.append("city", formData.city);
    orderForm.append("note", formData.note);
    orderForm.append("location", JSON.stringify({ lat: formData.lat, lng: formData.lng }));
    if (formData.mapLink) {
      orderForm.append("mapLink", formData.mapLink);
    }
    orderForm.append("paymentMethod", formData.payment);
    orderForm.append(
      "items",
      JSON.stringify(
        cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.discountPrice ?? item.price,
        }))
      )
    );
    if (paymentScreenshot) {
      orderForm.append("paymentScreenshot", paymentScreenshot);
    }

    // 3. Execution (Single try-catch block)
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        body: orderForm,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order.");
      }

      setSubmitted(true);
      clearCart();
      clearScreenshot();
    } catch (error) { 
      console.error("Order submission failed:", error);
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <form className={styles.formCard} onSubmit={handleSubmit} style={{ position: "relative" }}>
            
            {isSubmitting && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px", // Matches your form card border radius
                backdropFilter: "blur(2px)"
              }}>
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#085ff6" // Adjust to match your brand primary color
                >
                  <g fill="none" fillRule="evenodd">
                    <g transform="translate(1 1)" strokeWidth="4">
                      <circle strokeOpacity=".3" cx="24" cy="24" r="24" />
                      <path d="M48 24c0-13.255-10.745-24-24-24">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 24 24"
                          to="360 24 24"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </g>
                  </g>
                </svg>
                <p style={{ marginTop: "1rem", fontWeight: 600, color: "#333" }}>Processing your order...</p>
              </div>
            )}

            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <h2 style={{ color: "#28a745", borderBottom: "none" }}>🎉 Order Placed Successfully!</h2>
                <p>Thank you for shopping with NebudsBliss.</p>
              </div>
            ) : (
              <>
                <h2>Shipping details</h2>

                {submitError && (
                  <div style={{ background: "#ffeef0", color: "#d9534f", padding: "12px", borderRadius: "8px", marginBottom: "1.5rem", fontWeight: 500 }}>
                    {submitError}
                  </div>
                )}

                <div className={styles.grid}>
                  <label>
                    Full name
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </label>

                <label>
                  City
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Birgunj"
                    required
                    disabled={isSubmitting}
                  />
                </label>

                <label style={{ display: "block", marginBottom: "1.5rem" }}>
                  Pinpoint your exact delivery location
                  <div style={{ marginTop: "0.5rem" }}>
                    <LocationPicker 
                      initialLat={formData.lat} 
                      initialLng={formData.lng} 
                      onLocationSelect={handleLocationSelect} 
                    />
                  </div>
                </label>

                <div className={styles.paymentSection}>
                  <span className={styles.paymentLabel}>Payment method</span>
                  <div className={styles.paymentOptions}>
                    {paymentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isSubmitting}
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
                  {formData.payment === PAYMENT_METHOD.BANK && (
                    <div className={styles.qrContainer}>
                      <p className={styles.qrText}>Scan the QR code to complete your transfer:</p>
                      <img src={qrBank} alt="Bank QR Code" className={styles.qrImage} />

                      <div className={styles.screenshotUpload}>
                        <p className={styles.qrText}>
                          Then upload a screenshot of the completed transfer:
                        </p>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleScreenshotChange}
                          disabled={isSubmitting}
                          className={styles.screenshotInput}
                          id="paymentScreenshot"
                        />

                        {!screenshotPreview && (
                          <label htmlFor="paymentScreenshot" className={styles.screenshotLabel}>
                            Choose screenshot
                          </label>
                        )}

                        {screenshotPreview && (
                          <div className={styles.screenshotPreviewWrap}>
                            <img
                              src={screenshotPreview}
                              alt="Payment screenshot preview"
                              className={styles.screenshotPreview}
                            />
                            <button
                              type="button"
                              className={styles.screenshotRemoveBtn}
                              onClick={clearScreenshot}
                              disabled={isSubmitting}
                            >
                              Remove & choose another
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <label>
                  Delivery note
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Any special instructions?"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </label>

                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                >
                  Place order
                </button>
              </>
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
                            disabled={isSubmitting}
                            onClick={() => changeQuantity(item._id, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            disabled={isSubmitting}
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

                <button 
                  type="button" 
                  className={styles.secondaryBtn} 
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
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
