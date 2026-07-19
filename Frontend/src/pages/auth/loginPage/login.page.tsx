import React, { useState } from "react";
import styles from "./login.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcon.png";
import passwordIcon from "../../../img/icons/password.png";
import { API_ENDPOINTS } from "../../../constants/constants";
import ForgotPassword from "../forgotPasswordPage/forgotPasswordPage";

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // NEW: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("token", data.data.accessToken);

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
    <>
      {!isForgotOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <main
            className={styles.loginCard}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#888",
              }}
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
                    // NEW: Dynamically change input type based on state
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {/* NEW: Toggle Button */}
                  <button
                    type="button"
                    className={styles.togglePasswordBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1} // Prevents messing up the normal tab flow
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errorMessage && (
                  <div
                    style={{
                      color: "#f87171",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
              </div>

              <div
                className={styles.forgotPassword}
                onClick={() => setIsForgotOpen(true)}
              >
                Forgot Password?
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <div className={styles.divider}>
              <span>Or</span>
            </div>

            <footer className={styles.signupPrompt}>
              Don't have an account?{" "}
              <button type="button" onClick={onSwitchToRegister} className={styles.linkButton}>
                Sign Up
              </button>
            </footer>
          </main>
        </div>
      )}

      <ForgotPassword
        isOpen={isForgotOpen}
        onClose={onClose}
        onBack={() => setIsForgotOpen(false)}
      />
    </>
  );
};

export default LoginPage;