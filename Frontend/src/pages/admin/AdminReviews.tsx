import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import shared from "./admin.shared.module.scss";
import styles from "./AdminReviews.module.scss";
import ConfirmDialog from "./ConfirmDialog";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

interface ReviewUser {
  _id: string;
  fullName?: string;
  email?: string;
  image?: { url?: string; optimizeUrl?: string } | null;
}
interface ReviewItem {
  _id: string;
  name: string;
  images?: { url?: string; optimizeUrl?: string }[];
}
interface Review {
  _id: string;
  item: ReviewItem;
  user: ReviewUser;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
interface ApiErrorBody { message?: string; }

const imgSrc = (i?: { optimizeUrl?: string; url?: string } | null): string => i?.optimizeUrl || i?.url || "";
const errMsg = (e: unknown, fallback: string): string => {
  const body = (e as { response?: { data?: ApiErrorBody } })?.response?.data;
  return body?.message || fallback;
};

const formatDate = (iso?: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const StarDisplay: React.FC<{ value: number }> = ({ value }) => {
  const rounded = Math.round(value);
  return (
    <span className={styles.reviewRating} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? styles.starFilled : styles.star}>★</span>
      ))}
      <span className={styles.ratingNum}>{value.toFixed(1)}</span>
    </span>
  );
};

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.GET_ALL_REVIEWS, { headers: authHeaders() });
      setReviews(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

      useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matches the established admin data-loading pattern (see AdminOrders)
    loadReviews();
  }, [loadReviews]);

  const removeReview = async (id: string) => {
    setDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.DELETE_REVIEW(id), { headers: authHeaders() });
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted.");
    } catch (e) {
      toast.error(errMsg(e, "Failed to delete review."));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removeReview(deleteTarget._id);
    setDeleteTarget(null);
  };
  const filtered = search.trim()
    ? reviews.filter(
        (r) =>
          r.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          r.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.comment?.toLowerCase().includes(search.toLowerCase()) ||
          r.title?.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Reviews</h1>
          <p className={shared.pageSubtitle}>
            All product reviews across the store. Search by reviewer, product,
            or comment.
          </p>
        </div>
        <input
          className={`${shared.input} ${styles.searchBox}`}
          placeholder="Search reviews…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.reviewsSummary}>
        <div className={styles.summaryStat}>
          <span className={styles.count}>{filtered.length}</span> review
          {filtered.length !== 1 ? "s" : ""}
        </div>
        {reviews.length > 0 && (
          <div className={styles.summaryStat}>
            <span className={styles.count}>
              {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
            </span>{" "}
            average rating
          </div>
        )}
      </div>

      {loading ? (
        <div className={shared.loading}>
          <span className={shared.spinner} />
          Loading reviews…
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {search ? "No reviews match your search." : "No reviews yet."}
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {filtered.map((r) => (
            <div key={r._id} className={styles.reviewCard}>
              <img
                src={imgSrc(r.user?.image) || "/logo.transparent.png"}
                alt={r.user?.fullName || "Reviewer"}
                className={styles.reviewAvatar}
              />
              <div>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAuthor}>
                    {r.user?.fullName || "Anonymous"}
                  </span>
                  {r.user?.email && (
                    <span className={shared.muted}>({r.user.email})</span>
                  )}
                  <StarDisplay value={r.rating} />
                </div>
                {r.title && <p className={styles.reviewTitle}>{r.title}</p>}
                <p className={styles.reviewComment}>{r.comment}</p>
              </div>
              <div className={styles.reviewMeta}>
                {r.item ? (
                  <div>
                    <span className={shared.muted}>Product:</span>{" "}
                    <span className={styles.reviewProduct}>
                      {r.item.name || "—"}
                    </span>
                  </div>
                ) : (
                  <span className={shared.muted}>Product deleted</span>
                )}
                <div>
                  <span className={shared.muted}>Reviewed:</span>{" "}
                  {formatDate(r.createdAt)}
                </div>
              </div>
              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={`${shared.btn} ${shared.btnDanger}`}
                  onClick={() => setDeleteTarget(r)}
                  disabled={deleting}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove this review?"
        message={
          deleteTarget
            ? `This will permanently delete the review from ${
                deleteTarget.user?.fullName || "this customer"
              } on "${deleteTarget.item?.name || "a product"}".`
            : ""
        }
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
    );
};

export default AdminReviews;



