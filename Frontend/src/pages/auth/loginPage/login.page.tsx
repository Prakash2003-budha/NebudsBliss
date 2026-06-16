import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import styles from "./login.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcon.png";
import passwordIcon from "../../../img/icons/password.png";
import { API_ENDPOINTS } from "../../../constants/constants";
// import { API_ENDPOINTS } from "../../../constants/constants";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

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

      // Safely parse JSON (in case the server returns a blank page or HTML error)
      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        // Success! Save tokens and redirect
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        navigate("/"); 

      } else {
        // Handle backend errors
        if (data && data.status === "ACCOUNT_NOT_ACTIVATED") {
          setErrorMessage("Your account is not activated. Please check your email inbox for the activation link.");
        } else if (data && data.message) {
          setErrorMessage(data.message); // Show whatever specific message the backend sent
        } else {
          setErrorMessage("Invalid credentials. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Cannot connect to the server right now. Please check your console.");
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
            
            {/* MOVED: Error message is now directly under the password input */}
            {errorMessage && (
              <div style={{ 
                color: "#f87171", 
                fontSize: "0.85rem", 
                marginTop: "0.25rem", // Small margin to space it slightly from the input
                lineHeight: "1.4"
              }}>
                {errorMessage}
              </div>
            )}
          </div>

          <Link to="/Forgot-Password" className={styles.forgotPassword}>
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
          Don't have an account? <Link to="/SignUp">Sign Up</Link>
        </footer>

      </main>
    </div>
  );
};

export default LoginPage;