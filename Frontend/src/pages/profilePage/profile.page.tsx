import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import { API_ENDPOINTS } from "../../constants/constants";
import styles from "./profile.page.module.scss";

/** Format an ISO date as "Jan 5, 2026"; returns an em dash when empty/invalid. */
const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Two-letter initials from a full name, used as the avatar fallback. */
const getInitials = (name?: string): string => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0].toUpperCase()).join("") || "?";
};

const displayValue = (value?: string): string => (value && value.trim() ? value : "—");

interface Profile {
  fullName: string;
  email: string;
  role: string;
  address: string;
  phone: string;
  status: boolean;
  image?: { url: string };
  _id: string;
  createdAt: string;
  dob: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return;
    }

    const controller = new AbortController();
    axios
      .post(
        API_ENDPOINTS.MY_PROFILE,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        }
      )
      .then((res) => setProfile(res.data.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError("Could not load your profile. Please log in again.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <Layout>
      <div className={styles.container}>
        {loading && <div className={styles.stateMessage}>Loading your profile...</div>}

        {!loading && error && (
          <div className={styles.stateMessage}>
            {error}{" "}
            <Link to="/" className={styles.inlineLink}>
              Go home
            </Link>
          </div>
        )}

        {!loading && !error && profile && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              {profile.image?.url ? (
                <img
                  src={profile.image.url}
                  alt={profile.fullName}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback} aria-hidden="true">
                  {getInitials(profile.fullName)}
                </div>
              )}
              <div className={styles.identity}>
                <h1>{profile.fullName}</h1>
                <div className={styles.badges}>
                  <span className={styles.roleBadge}>{profile.role}</span>
                  <span className={profile.status ? styles.statusActive : styles.statusInactive}>
                    {profile.status ? "Active" : "Not activated"}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Email</span>
                <span>{displayValue(profile.email)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Phone</span>
                <span>{displayValue(profile.phone)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Address</span>
                <span>{displayValue(profile.address)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Date of Birth</span>
                <span>{formatDate(profile.dob)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Member Since</span>
                <span>{formatDate(profile.createdAt)}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <div className={styles.actionGroup}>
                <Link to="/orders" className={styles.primaryBtn}>
                  My Orders
                </Link>
                {profile.role === "Admin" && (
                  <Link to="/admin" className={styles.secondaryBtn}>
                    Admin Dashboard
                  </Link>
                )}
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
