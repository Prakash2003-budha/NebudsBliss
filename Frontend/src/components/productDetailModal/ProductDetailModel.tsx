import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./Productdetailmodal.module.scss";
import { useCart } from "../../context/userCart";
import { API_ENDPOINTS } from "../../constants/constants";
import profile from "../../img/icons/profile.black.png";
import { isValidDiscount, cartDiscountPrice } from "../../utils/price";

interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: { url: string; optimizeUrl: string }[];
  category: string;
  brand?: string;
  stockQuantity?: number;
  isActive: boolean;
  // Technical specifications for electronics
  specs?: {
    batteryCapacity?: number;  // mAh
    batteryType?: string;
    bluetoothVersion?: string;
    fastCharging?: boolean;
    weight?: number;  // grams
    dimensions?: string;  // L x W x H
    warrantyPeriod?: number;  // months
    colorOptions?: string[];
    compatibility?: string;
  };
}

interface ProductDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "details" | "reviews";

interface ReviewUser {
  _id: string;
  fullName?: string;
  image?: { url?: string; optimizeUrl?: string } | null;
}

interface Review {
  _id: string;
  item: string;
  user: ReviewUser;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Reads the logged-in user id from localStorage "user", if present.
function currentUserId(user: { _id?: string } | null): string | undefined {
  return user && user._id ? user._id : undefined;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

interface ApiErrorBody {
  message?: string;
}

// Pulls a friendly message out of an axios-style error when available.
const errorMessage = (err: unknown, fallback: string): string => {
  const body = (err as { response?: { data?: ApiErrorBody } })?.response?.data;
  return body?.message || fallback;
};

// Static star row used to display a rating value (1-5).
const StarDisplay: React.FC<{ value: number; size?: number }> = ({ value, size = 16 }) => {
  const rounded = Math.round(value);
  return (
    <span className={styles.stars} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ fontSize: size }}
          className={`${styles.star} ${n <= rounded ? styles.starFilled : ""}`}
        >
          ★
        </span>
      ))}
    </span>
  );
};

// Holds all "per product" transient UI state (quantity, active image, active tab).
// Mounted with key={item._id} from the parent, so React resets this state for us
// whenever the product changes — no setState-in-an-effect needed.
const ProductDetailContent: React.FC<{
  item: Item;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxOpenRef = useRef(false);

  useEffect(() => {
    lightboxOpenRef.current = lightboxOpen;
  }, [lightboxOpen]);

  // Render the technical specifications table from item.specs
  const renderSpecs = () => {
    if (!item.specs) return null;
    const specEntries = [
      { label: "Battery Capacity", value: item.specs.batteryCapacity ? `${item.specs.batteryCapacity} mAh` : "N/A" },
      { label: "Battery Type", value: item.specs.batteryType ? item.specs.batteryType : "N/A" },
      { label: "Bluetooth Version", value: item.specs.bluetoothVersion ? item.specs.bluetoothVersion : "N/A" },
      { label: "Fast Charging", value: item.specs.fastCharging ? "Yes" : "No" },
      { label: "Weight", value: item.specs.weight ? `${item.specs.weight} g` : "N/A" },
      { label: "Dimensions", value: item.specs.dimensions ? item.specs.dimensions : "N/A" },
      { label: "Warranty Period", value: item.specs.warrantyPeriod ? `${item.specs.warrantyPeriod} months` : "N/A" },
      { label: "Color Options", value: item.specs.colorOptions?.length ? item.specs.colorOptions.join(", ") : "N/A" },
      { label: "Compatibility", value: item.specs.compatibility ? item.specs.compatibility : "N/A" },
    ];

    return (
      <div className={styles.specSection}>
        <h4 className={styles.specHeading}>Technical Specifications</h4>
        <div className={styles.specTable}>
          {specEntries.map((entry, index) => (
            <div
              key={index}
              className={`${styles.specRow} ${index % 2 === 0 ? styles.specRowEven : styles.specRowOdd}`}
            >
              <div className={styles.specCell}>{entry.label}</div>
              <div className={styles.specCell}>{entry.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Registered on mount — before the parent modal registers its own Escape
  // handler (child effects flush first) — so while the image lightbox is open,
  // Escape only closes the lightbox, not the whole modal.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpenRef.current && e.key === "Escape") {
        e.stopImmediatePropagation();
        setLightboxOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Review state ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingMine, setEditingMine] = useState(false);

  const [currentUser] = useState(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!currentUserId(currentUser) && !!localStorage.getItem("accessToken");

  const images = item.images && item.images.length > 0 ? item.images : null;
  const activeImage = images ? images[activeImageIndex] : null;
  const hasDiscount = isValidDiscount(item.price, item.discountPrice);
  const discountPercent = hasDiscount
    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
    : 0;
  const isOutOfStock = typeof item.stockQuantity === "number" && item.stockQuantity <= 0;

  const myUserId = currentUserId(currentUser);
  const myReview = myUserId
    ? reviews.find((r) => r.user && r.user._id === myUserId)
    : null;
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Fetch the reviews for this product whenever it (re)mounts.
  useEffect(() => {
    let active = true;

    axios
      .get(API_ENDPOINTS.GET_REVIEWS(item._id))
      .then((res) => {
        if (!active) return;
        setReviews(res.data?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setReviewsError("Unable to load reviews right now.");
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [item._id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        discountPrice: cartDiscountPrice(item.price, item.discountPrice),
        image: activeImage
          ? activeImage.optimizeUrl || activeImage.url
          : "https://via.placeholder.com/300x400",
      });
    }
    onClose();
  };

  const descriptionParagraphs = item.description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const openEditForm = () => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title || "");
      setComment(myReview.comment);
    }
    setEditingMine(true);
  };

  const cancelEdit = () => {
    setEditingMine(false);
    setRating(0);
    setTitle("");
    setComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("You must be logged in to leave a review.");
      return;
    }
    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a short comment.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        API_ENDPOINTS.CREATE_REVIEW,
        { item: item._id, rating, title: title.trim(), comment: comment.trim() },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success(myReview ? "Your review has been updated." : "Review submitted. Thank you!");

      const res = await axios.get(API_ENDPOINTS.GET_REVIEWS(item._id));
      setReviews(res.data?.data ?? []);
      cancelEdit();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to submit your review. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;
    if (!window.confirm("Delete your review?")) return;

    try {
      await axios.delete(API_ENDPOINTS.DELETE_REVIEW(reviewId), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Review deleted.");
      const res = await axios.get(API_ENDPOINTS.GET_REVIEWS(item._id));
      setReviews(res.data?.data ?? []);
      cancelEdit();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete the review."));
    }
  };

  return (
    <div
      className={styles.modal}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        &times;
      </button>
      <span className={styles.dragHandle} aria-hidden="true" />

      <div className={styles.content}>
          {/* Gallery */}
          <div className={styles.gallery}>
            {/* One big main image — clicking it opens the full-size lightbox */}
            <button
              type="button"
              className={styles.mainImageBtn}
              onClick={() => setLightboxOpen(true)}
              aria-label={`View ${item.name} image in full size`}
            >
              <img
                src={
                  activeImage
                    ? activeImage.optimizeUrl || activeImage.url
                    : (profile as string)
                }
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profile as string;
                }}
              />
              <span className={styles.zoomHint} aria-hidden="true">
                ⤢ View full image
              </span>
            </button>

            {/* Remaining images as small thumbnails */}
            {images && images.length > 1 && (
              <div className={styles.thumbnails} role="tablist" aria-label="Product images">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.thumbnailBtn} ${
                      idx === activeImageIndex ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-selected={idx === activeImageIndex}
                  >
                    <img
                      src={img.optimizeUrl || img.url}
                      alt={`${item.name} ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = profile as string;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.categoryTab}>{item.category}</span>
            <h2 className={styles.title}>{item.name}</h2>

            <div className={styles.priceRow}>
              {hasDiscount ? (
                <>
                  <span className={styles.oldPrice}>Rs. {item.price}</span>
                  <span className={styles.currentPrice}>
                    Rs. {item.discountPrice}
                  </span>
                  <span className={styles.discountBadge}>
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className={styles.currentPrice}>Rs. {item.price}</span>
              )}
            </div>
            <p className={styles.shippingNote}>
              Shipping is calculated at checkout
            </p>

            {(item.brand || typeof item.stockQuantity === "number") && (
              <div className={styles.productMeta}>
                {item.brand && (
                  <span className={styles.metaItem}>
                    <strong>Brand:</strong> {item.brand}
                  </span>
                )}
                {typeof item.stockQuantity === "number" && (
                  <span className={styles.metaItem}>
                    <strong>Stock:</strong>{" "}
                    <span className={isOutOfStock ? styles.outOfStock : styles.inStock}>
                      {isOutOfStock ? "Out of stock" : `${item.stockQuantity} in stock`}
                    </span>
                  </span>
                )}
              </div>
            )}

            <div className={styles.quantityRow}>
              <div className={styles.quantitySelector}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of Stock" : "Add To Cart"}
              </button>
            </div>

            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "details" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "reviews" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews{reviews.length ? ` (${reviews.length})` : ""}
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "details" ? (
                <>
                  {descriptionParagraphs.length > 0 ? (
                    descriptionParagraphs.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))
                  ) : (
                    <p>No description available.</p>
                  )}
                  {item.specs && renderSpecs()}
                </>
              ) : (
                <div className={styles.reviewsBlock}>
                  {reviews.length > 0 && (
                    <div className={styles.reviewsHeader}>
                      <span className={styles.reviewsAverage}>
                        {average.toFixed(1)}
                      </span>
                      <div className={styles.reviewsRatingWrap}>
                        <StarDisplay value={average} size={15} />
                        <span className={styles.reviewsCount}>
                          {reviews.length}{" "}
                          {reviews.length === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                    </div>
                  )}

                  {reviewsLoading ? (
                    <p className={styles.noReviews}>Loading reviews…</p>
                  ) : reviewsError ? (
                    <p className={styles.noReviews}>{reviewsError}</p>
                  ) : reviews.length === 0 ? (
                    <p className={styles.noReviews}>
                      No reviews yet. Be the first to review this product.
                    </p>
                  ) : (
                    <ul className={styles.reviewList}>
                      {reviews.map((review) => {
                        const isMine =
                          !!review.user && review.user._id === myUserId;
                        return (
                          <li key={review._id} className={styles.reviewItem}>
                            <div className={styles.reviewTop}>
                              <StarDisplay value={review.rating} size={14} />
                              <span className={styles.reviewDate}>
                                {formatDate(review.createdAt)}
                              </span>
                              {isMine && (
                                <span className={styles.mineTag}>You</span>
                              )}
                            </div>
                            {review.title && (
                              <h4 className={styles.reviewTitle}>
                                {review.title}
                              </h4>
                            )}
                            <p className={styles.reviewComment}>
                              {review.comment}
                            </p>
                            <div className={styles.reviewAuthor}>
                              {review.user?.image?.optimizeUrl ||
                              review.user?.image?.url ? (
                                <img
                                  className={styles.reviewAvatar}
                                  src={
                                    review.user!.image!.optimizeUrl ||
                                    review.user!.image!.url ||
                                    (profile as string)
                                  }
                                  alt=""
                                />
                              ) : (
                                <span className={styles.reviewAvatarFallback}>
                                  {(review.user?.fullName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                              <span className={styles.reviewName}>
                                {review.user?.fullName || "Anonymous"}
                              </span>
                            </div>
                            {isMine && (
                              <div className={styles.reviewActions}>
                                <button
                                  type="button"
                                  className={styles.reviewEditBtn}
                                  onClick={openEditForm}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={styles.reviewDeleteBtn}
                                  onClick={() => handleDeleteReview(review._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {!isLoggedIn ? (
                    <p className={styles.loginPrompt}>
                      <a href="/login" className={styles.loginPromptLink}>
                        Log in
                      </a>{" "}
                      to write a review.
                    </p>
                  ) : myReview && !editingMine ? (
                    <button
                      type="button"
                      className={styles.writeReviewBtn}
                      onClick={openEditForm}
                    >
                      Edit your review
                    </button>
                  ) : (
                    <form
                      className={styles.reviewForm}
                      onSubmit={handleSubmitReview}
                    >
                      <h4 className={styles.reviewFormTitle}>
                        {editingMine ? "Edit your review" : "Write a review"}
                      </h4>

                      <div className={styles.ratingInput}>
                        <span className={styles.ratingLabel}>Your rating</span>
                        <span className={styles.starsInput}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={`${styles.star} ${
                                n <= rating ? styles.starFilled : ""
                              }`}
                              onClick={() => setRating(n)}
                              aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            >
                              ★
                            </button>
                          ))}
                        </span>
                      </div>

                      <input
                        className={styles.reviewInput}
                        type="text"
                        placeholder="Add a title (optional)"
                        value={title}
                        maxLength={80}
                        onChange={(e) => setTitle(e.target.value)}
                      />

                      <textarea
                        className={styles.reviewTextarea}
                        placeholder="Share your thoughts about this product…"
                        value={comment}
                        maxLength={1000}
                        rows={4}
                        onChange={(e) => setComment(e.target.value)}
                      />

                      <div className={styles.reviewFormActions}>
                        <button
                          type="submit"
                          className={styles.reviewSubmitBtn}
                          disabled={submitting}
                        >
                          {submitting
                            ? "Submitting…"
                            : editingMine
                            ? "Update review"
                            : "Submit review"}
                        </button>
                        {editingMine && (
                          <button
                            type="button"
                            className={styles.reviewCancelBtn}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

      {/* Full-size image lightbox — rendered via portal to document.body */}
      {lightboxOpen && activeImage &&
        createPortal(
          <div
            className={styles.lightbox}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${item.name} — full image`}
          >
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={activeImage.optimizeUrl || activeImage.url}
              alt={item.name}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = profile as string;
              }}
            />
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  // Escape key + body scroll lock while open. This effect only touches the
  // DOM/document (an external system), not component state, so it's fine here.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* key={item._id} makes React remount this on product change, so
          quantity/activeImageIndex/activeTab reset for free — no effect needed. */}
      <ProductDetailContent key={item._id} item={item} onClose={onClose} />
    </div>
  );
};

export default ProductDetailModal;