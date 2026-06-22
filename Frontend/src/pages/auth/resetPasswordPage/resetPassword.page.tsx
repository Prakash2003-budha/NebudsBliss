import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./resetPassword.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import passwordIcon from "../../../img/icons/password.png";
import { API_ENDPOINTS } from "../../../constants/constants";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Grabs the ?token=... from the URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Client-side validation
    if (!token) {
      setMessage({ type: "error", text: "Invalid or missing reset token. Please request a new link." });
      return;
    }

    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match!" });
      return;
    }

    if (password.length < 6) {
      setFormErrors({ password: "Password must be at least 6 characters." });
      return;
    }

    // 2. Clear old errors and start loading
    setLoading(true);
    setFormErrors({});
    setMessage({ type: null, text: "" });

    // 3. Send request to backend
    try {
      const response = await fetch(API_ENDPOINTS.RESETPASSWORD, {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully! Redirecting to login..." });
        
        // Redirect to login page after 2 seconds so they can read the success message
        setTimeout(() => {
          navigate("/LoginPage");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to reset password. The link may have expired." });
      }
    } catch  {
      setMessage({ type: "error", text: "Cannot connect to the server right now." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <main className={styles.card}>
        
        <header className={styles.headerSection}>
          <Link to="/">
            <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />
          </Link>
          <h1 className={styles.title}>Create New Password</h1>
          <p className={styles.subtitle}>Enter your new secure password below</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">New Password</label>
            <div className={styles.inputFieldWrapper}>
              <img src={passwordIcon} className={styles.icon} alt="Password icon" />
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: "" }));
                }} 
                required 
                disabled={loading || message.type === "success"}
              />
            </div>
            {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.inputFieldWrapper}>
              <img src={passwordIcon} className={styles.icon} alt="Password icon" />
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••••••" 
                value={confirmPassword} 
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }} 
                required 
                disabled={loading || message.type === "success"}
              />
            </div>
            {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
          </div>

          {/* Server Status Messages */}
          {message.type && (
            <div style={{ 
              color: message.type === "success" ? "#4ade80" : "#f87171", 
              fontSize: "0.85rem", 
              textAlign: "center",
              marginTop: "0.5rem"
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading || message.type === "success"}>
            {loading ? "SAVING..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <footer className={styles.loginPrompt}>
          Remember your password? <Link to="/LoginPage">Sign In</Link>
        </footer>

      </main>
    </div>
  );
};

export default ResetPassword;