import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import { compressImage } from "../../../utils/imageCompression";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false); 

  // NEW: States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (globalError) setGlobalError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0], { maxDimension: 800, quality: 0.82 });
      setFormData((prev) => ({ ...prev, image: compressed }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    setFormErrors({}); 
    setGlobalError(null);
    
    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("confirmPassword", formData.confirmPassword);
    submitData.append("dob", formData.dob);
    submitData.append("gender", formData.gender);
    submitData.append("phone", formData.phone);
    submitData.append("address", formData.address);

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Registration successful:", response.data);

      toast.success(
        <div>
          <p style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "8px" }}>
            🎉 Registration Successful!
          </p>
          <p style={{ marginBottom: "8px", lineHeight: "1.5" }}>
            A verification email has been sent to <span style={{ fontWeight: "bold" }}>{formData.email}</span>
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: "1.5" }}>
            Please check your inbox and click the activation link to activate your account before logging in.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          style: { width: "420px" },
          onClose: () => {
            onClose();
            onSwitchToLogin();
          },
        }
      );

    } catch (error: unknown) {
      console.error("Registration failed:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = error.response.data?.error;
        
        if (backendErrors && typeof backendErrors === 'object') {
          setFormErrors(backendErrors as Record<string, string>);
          toast.error("Please fix the errors in the form and try again.", { position: "top-center", autoClose: 4000 });
        } else {
          const message = error.response.data?.message || "Registration failed. Please try again.";
          setGlobalError(message);
          toast.error(message, { position: "top-center", autoClose: 4000 });
        }
      } else {
        const message = "An unexpected error occurred. Please check your connection.";
        setGlobalError(message);
        toast.error(message, { position: "top-center", autoClose: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <ToastContainer style={{ zIndex: 9999 }} />

      <main className={styles.signupModalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          &times;
        </button>

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
                <input type="tel" id="phone" name="phone" placeholder="98XXXXXXXX" value={formData.phone} onChange={handleChange} required />
              </div>
              {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
            </div>

            {/* DOB */}
            <div className={styles.inputGroup}>
              <label htmlFor="dob">Date of Birth</label>
              <div className={styles.inputFieldWrapper}>
                <img src={calendarIcon} className={styles.icon} alt="" />
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
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  placeholder="••••••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputFieldWrapper}>
                <img src={passwordIcon} className={styles.icon} alt="" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="••••••••••••" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
            </div>
          </div>

          {/* Profile Image */}
          <div className={styles.inputGroup} style={{ marginTop: "0.5rem" }}>
            <label htmlFor="image">Profile Image (Optional)</label>
            <div className={styles.inputFieldWrapper}>
              <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
            </div>
          </div>

          {globalError && (
            <div className={styles.globalErrorText}>
              {globalError}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or</span>
        </div>

        <footer className={styles.loginPrompt}>
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin} className={styles.linkButton}>
            Sign In
          </button>
        </footer>

      </main>
    </div>
  );
};

export default SignUpModal;