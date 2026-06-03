


import React, { useState } from "react";
import styles from "./login.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";
import gmail from "../../../img/icons/gmailIcone.png"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle auth handling logic here
    console.log("Logging in with:", { email, password });
  };

  return (
    <div className={styles.loginWrapper}>
      <main className={styles.loginCard}>
        
        {/* Header Section */}
        <header className={styles.headerSection}>
          <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your Nebuds Bliss account</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputFieldWrapper}>
              {/* Inline SVG Mail Icon */}
              <img src={gmail} className={styles.icon} alt="" />
              <input
                type="email"
                id="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputFieldWrapper}>
              {/* Inline SVG Lock Icon */}
              <input
                type="password"
                id="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Forgot Password */}
          <a href="/forgot-password" className={styles.forgotPassword}>
            Forgot Password?
          </a>

          {/* Login Button */}
          <button type="submit" className={styles.submitBtn}>
            SIGN IN
          </button>
        </form>

        {/* Social Authentication Splitter */}
        <div className={styles.divider}>
          <span>Or sign in with</span>
        </div>

        {/* OAuth Buttons */}
        <div className={styles.socialRow}>
          <button type="button" className={styles.socialBtn} onClick={() => alert('FB OAuth')}>
            Facebook
          </button>
          <button type="button" className={styles.socialBtn} onClick={() => alert('Google OAuth')}>
            Google
          </button>
        </div>

        {/* Signup Redirect */}
        <footer className={styles.signupPrompt}>
          Don't have an account? <a href="/signup">Sign Up</a>
        </footer>

      </main>
    </div>
  );
};

export default LoginPage;