import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./forgotPasswordPage.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcon.png";
import { API_ENDPOINTS } from "../../../constants/constants";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: null, text: "" }); 

    try {
      const response = await fetch(API_ENDPOINTS.FORGETPASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setMessage({ type: "success", text: "A reset link has been sent to your gmail account to reset your password." });
        setEmail(""); 
      } else {
        if (data && data.status === "ACCOUNT_NOT_ACTIVATED") {
            setMessage({ type: "error", text: "Your account is not activated. Please verify your email first." });
        } else {
            setMessage({ type: "error", text: data?.message || "Failed to send reset link. Please try again." });
        }
      }
    } catch {
        console.log("erroe here")
      setMessage({ type: "error", text: "Cannot connect to the server right now." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <main className={styles.loginCard}>
        
        <header className={styles.headerSection}>
            <Link to="/">
                <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />            
            </Link>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your email to receive a reset link</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputFieldWrapper}>
              <img src={gmail} className={styles.icon} alt="Email icon" />
              <input
                type="email"
                id="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {message.type && (
            <div style={{ 
              color: message.type === "success" ? "#4ade80" : "#f87171", 
              fontSize: "0.85rem", 
              textAlign: "center" 
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "SENDING..." : "SEND RESET LINK"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <footer className={styles.signupPrompt}>
          Remember your password? <Link to="/LoginPage">Sign In</Link>
        </footer>

      </main>
    </div>
  );
};

export default ForgotPassword;