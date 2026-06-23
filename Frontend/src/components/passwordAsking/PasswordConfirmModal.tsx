import React, { useState } from 'react';
import styles from './passwordConfirmModal.module.scss';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/constants'; // Adjusted to match your directory tree

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [isValidATING, setIsValidating] = useState(false); // Tracks backend request status

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return alert("Please enter your password to authorize this action.");
    
    setIsValidating(true);

    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(
        API_ENDPOINTS.VERIFY_PASSWORD, 
        { password }, 
        {
          headers: {
            'Authorization': accessToken ? `Bearer ${accessToken}` : ''
          },
          withCredentials: true
        }
      );

      // If backend confirms the user password checks out successfully:
      if (response.data.success || response.status === 200) {
        onConfirm(password); // Callback triggers handleFinalDatabaseSave inside AddItemTab
        setPassword(''); 
      }
    } catch (error: unknown) { // 👈 FIXED: Changed 'any' to 'unknown' to fix the TypeScript ESLint error
      console.error("Password verification failed:", error);
      
      if (axios.isAxiosError(error)) {
        // Grab the precise message sent by our backend global error handler
        const errorMessage = error.response?.data?.message || "Incorrect password. Access denied.";
        alert(errorMessage);
        
        // If the backend threw a session expiry error, clear out local storage and redirect
        const status = error.response?.data?.status;
        if (status === "JWT_EXPIRED" || status === "JWT_MALFORMED" || error.response?.status === 401) {
          localStorage.removeItem('accessToken'); // 👈 FIXED: Clear 'accessToken'
          window.location.href = '/';
        }
        else{
          alert(errorMessage)
        }
      } else {
        alert("An error occurred during verification. Please try again.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={isValidATING ? undefined : onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Confirm Admin Action</h3>
          <button className={styles.closeButton} disabled={isValidATING} onClick={onClose}>&times;</button>
        </div>
        
        <p className={styles.warningText}>
          Please type your password to confirm.
        </p>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your security password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={isValidATING}
              required
            />
          </div>

          <div className={styles.actionButtonGroup}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              disabled={isValidATING} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.confirmButton} 
              disabled={isValidATING}
            >
              {isValidATING ? "Verifying..." : "Verify & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;