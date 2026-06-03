import React, { useState } from "react";
import styles from "./register.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";

// Icons (Make sure you have these in your icons folder!)
import gmailIcon from "../../../img/icons/gmailIcon.png";
import passwordIcon from "../../../img/icons/password.png";
import userIcon from "../../../img/icons/profile.white.png"; 
import phoneIcon from "../../../img/icons/phone.png";
import locationIcon from "../../../img/icons/location.png";
import calendarIcon from "../../../img/icons/calender.png";

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Because you have an image file, you will eventually need to 
    // submit this using FormData instead of standard JSON!
    console.log("Registering with:", formData);
  };

  return (
    <div className={styles.signupWrapper}>
      <main className={styles.signupCard}>
        
        <header className={styles.headerSection}>
          <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Nebuds Bliss today</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles.formGrid}>
            {/* Full Name */}
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <div className={styles.inputFieldWrapper}>
                <img src={userIcon} className={styles.icon} alt="" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Alex Johnson"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <div className={styles.inputFieldWrapper}>
                <img src={gmailIcon} className={styles.icon} alt="" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.inputFieldWrapper}>
                <img src={phoneIcon} className={styles.icon} alt="" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+977 98..."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* DOB */}
            <div className={styles.inputGroup}>
              <label htmlFor="dob">Date of Birth</label>
              <div className={styles.inputFieldWrapper}>
                <img src={calendarIcon} className={styles.icon} alt="" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className={styles.inputGroup}>
              <label htmlFor="gender">Gender</label>
              <div className={styles.inputFieldWrapper}>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={styles.selectField}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className={styles.inputGroup}>
              <label htmlFor="address">Address</label>
              <div className={styles.inputFieldWrapper}>
                <img src={locationIcon} className={styles.icon} alt="" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Street, City"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password (Full Width) */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputFieldWrapper}>
              <img src={passwordIcon} className={styles.icon} alt="" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Profile Image (Full Width) */}
          <div className={styles.inputGroup}>
            <label htmlFor="image">Profile Image (Optional)</label>
            <div className={styles.inputFieldWrapper}>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            CREATE ACCOUNT
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <footer className={styles.loginPrompt}>
          Already have an account? <a href="/loginpage">Sign In</a>
        </footer>

      </main>
    </div>
  );
};

export default SignUpPage;