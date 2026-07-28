import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/layout/layout";
import { API_ENDPOINTS } from "../../constants/constants";
import profileIcon from "../../img/icons/profile.black.png";
import styles from "./profile.page.module.scss";

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
              <img
                src={profile.image?.url || profileIcon}
                alt={profile.fullName}
                className={styles.avatar}
              />
              <div>
                <h1>{profile.fullName}</h1>
                <span className={styles.roleBadge}>{profile.role}</span>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Email</span>
                <span>{profile.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Phone</span>
                <span>{profile.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Address</span>
                <span>{profile.address}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Date of Birth</span>
                <span>{new Date(profile.dob).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Account Status</span>
                <span>{profile.status ? "Active" : "Not Activated"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Member Since</span>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/orders" className={styles.primaryBtn}>
                My Orders
              </Link>
              {profile.role === "Admin" && (
                <Link to="/admin" className={styles.secondaryBtn}>
                  Admin Dashboard
                </Link>
              )}
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
