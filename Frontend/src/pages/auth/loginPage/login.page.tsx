import { Link } from "react-router-dom";
import React, { useState } from "react";
import styles from "./login.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcon.png";
import passwordIcon from "../../../img/icons/password.png";
import { API_ENDPOINTS } from "../../../constants/constants";

// 1. UPDATE THE INTERFACE TO EXPECT ALL MODAL PROPS
interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

// 2. PASS PROPS INTO THE COMPONENT
const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 3. ADD THE GUARD: If the modal is not open, do not render anything
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        // Success! Save tokens
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Close the modal on success and refresh the page to update header state
        onClose(); 
        window.location.reload(); 

      } else {
        if (data && data.status === "ACCOUNT_NOT_ACTIVATED") {
          setErrorMessage("Your account is not activated. Please check your email.");
        } else if (data && data.message) {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Invalid credentials. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Cannot connect to the server right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 4. ADD MODAL OVERLAY: Clicking the background closes it
    <div className={styles.modalOverlay} onClick={onClose}>
      
      {/* 5. STOP PROPAGATION: Clicking inside the card won't close it */}
      <main className={styles.loginCard} onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
          aria-label="Close"
        >
          &times;
        </button>

        <header className={styles.headerSection}>
          <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
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
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputFieldWrapper}>
              <img src={passwordIcon} className={styles.icon} alt="Password icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            {errorMessage && (
              <div style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "0.25rem", lineHeight: "1.4" }}>
                {errorMessage}
              </div>
            )}
          </div>

          <Link to="/Forgot-Password" className={styles.forgotPassword} onClick={onClose}>
            Forgot Password?
          </Link>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <footer className={styles.signupPrompt}>
          {/* 6. SWITCHED FROM <Link> TO A BUTTON FOR MODAL SWITCHING */}
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToRegister} className={styles.linkButton}>
            Sign Up
          </button>
        </footer>

        {/* EXPLICIT CLOSE WINDOW BUTTON AT THE BOTTOM */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3ce3ff', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'underline' }}>
              Close Window
            </button>
        </div>

      </main>
    </div>
  );
};

export default LoginPage;