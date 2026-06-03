import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./register.page.module.scss";
import logo from "../../../img/logo/logo.transparent.png";

// Icons
import gmailIcon from "../../../img/icons/gmailIcon.png";
import passwordIcon from "../../../img/icons/password.png";
import userIcon from "../../../img/icons/profile.white.png"; 
import phoneIcon from "../../../img/icons/phone.png";
import locationIcon from "../../../img/icons/location.png";
import calendarIcon from "../../../img/icons/calender.png";

import { API_ENDPOINTS } from "../../../constants/constants";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 

  // 1. ADDED: confirmPassword to the state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "", 
    dob: "",
    gender: "",
    phone: "",
    address: "",
    image: null as File | null,
  });

  // 2. ADDED: A state to hold specific field errors from the backend
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the specific error when the user starts typing to fix it
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick frontend check so we don't bother the backend if passwords don't match
    if (formData.password !== formData.confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    setFormErrors({}); // Clear old errors
    
    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("confirmPassword", formData.confirmPassword); // Added to request
    submitData.append("dob", formData.dob);
    submitData.append("gender", formData.gender);
    submitData.append("phone", formData.phone);
    submitData.append("address", formData.address);

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Registration successful:", response.data);
      alert("Account created successfully! Please log in.");
      navigate("/loginpage");

    } catch (error: unknown) {
      console.error("Registration failed:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        // 3. CAPTURE: Look for that specific "error" object your backend sends
        const backendErrors = error.response.data?.error;
        
        if (backendErrors && typeof backendErrors === 'object') {
          // If it exists, update our state so the red text shows up under the inputs!
          setFormErrors(backendErrors as Record<string, string>);
        } else {
          // Fallback if it's a different type of error
          alert(error.response.data?.message || "Registration failed. Please try again.");
        }
      } else {
        alert("An unexpected error occurred.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format to prevent future dates in the calendar picker
  const today = new Date().toISOString().split("T")[0];

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
                <input type="text" id="fullName" name="fullName" placeholder="Alex Johnson" value={formData.fullName} onChange={handleChange} required minLength={2} maxLength={50} />
              </div>
              {formErrors.fullName && <span className={styles.errorText}>{formErrors.fullName}</span>}
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <div className={styles.inputFieldWrapper}>
                <img src={gmailIcon} className={styles.icon} alt="" />
                <input type="email" id="email" name="email" placeholder="alex@example.com" value={formData.email} onChange={handleChange} required />
              </div>
              {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
            </div>

            {/* Phone */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.inputFieldWrapper}>
                <img src={phoneIcon} className={styles.icon} alt="" />
                {/* Changed placeholder to reflect digits only */}
                <input type="tel" id="phone" name="phone" placeholder="98XXXXXXXX" value={formData.phone} onChange={handleChange} required />
              </div>
              {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
            </div>

            {/* DOB */}
            <div className={styles.inputGroup}>
              <label htmlFor="dob">Date of Birth</label>
              <div className={styles.inputFieldWrapper}>
                <img src={calendarIcon} className={styles.icon} alt="" />
                {/* Added max={today} to enforce past dates visually */}
                <input type="date" id="dob" name="dob" max={today} value={formData.dob} onChange={handleChange} required />
              </div>
              {formErrors.dob && <span className={styles.errorText}>{formErrors.dob}</span>}
            </div>

            {/* Gender */}
            <div className={styles.inputGroup}>
              <label htmlFor="gender">Gender</label>
              <div className={styles.inputFieldWrapper}>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className={styles.selectField}>
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {formErrors.gender && <span className={styles.errorText}>{formErrors.gender}</span>}
            </div>

            {/* Address */}
            <div className={styles.inputGroup}>
              <label htmlFor="address">Address</label>
              <div className={styles.inputFieldWrapper}>
                <img src={locationIcon} className={styles.icon} alt="" />
                <input type="text" id="address" name="address" placeholder="Street, City" value={formData.address} onChange={handleChange} required />
              </div>
              {formErrors.address && <span className={styles.errorText}>{formErrors.address}</span>}
            </div>
            
            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputFieldWrapper}>
                <img src={passwordIcon} className={styles.icon} alt="" />
                <input type="password" id="password" name="password" placeholder="••••••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
            </div>

            {/* Confirm Password (NEW) */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputFieldWrapper}>
                <img src={passwordIcon} className={styles.icon} alt="" />
                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
              {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
            </div>
          </div>

          {/* Profile Image (Full Width) */}
          <div className={styles.inputGroup} style={{ marginTop: "0.5rem" }}>
            <label htmlFor="image">Profile Image (Optional)</label>
            <div className={styles.inputFieldWrapper}>
              <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
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