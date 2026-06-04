import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./forgotPasswordPage.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcon.png";
import { API_ENDPOINTS } from "../../../constants/constants";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  
  // New states for handling the API request UI
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: null, text: "" }); // Reset message on new submission

    try {
      // ✅ Fixed the stray parenthesis here
      const response = await fetch(API_ENDPOINTS.FORGETPASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Tell the user to check their email.
        setMessage({ type: "success", text: "If that email is in our system, a reset link has been sent." });
        setEmail(""); // Optional: clear the input
      } else {
        // Backend returned an error (e.g., 400 or 404)
        setMessage({ type: "error", text: data.message || "Failed to send reset link. Please try again." });
      }
    } catch {
      // Network error (e.g., backend is down)
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

          {/* Display Success or Error Messages */}
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