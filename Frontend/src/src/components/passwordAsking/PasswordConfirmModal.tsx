import React, { useState } from 'react';
import styles from './passwordConfirmModal.module.scss';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/constants';
import { toast } from 'react-toastify';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [isValidATING, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.warning('Please enter your password to authorize this action.');
      return;
    }

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

      if (response.data.success || response.status === 200) {
        onConfirm();
        setPassword('');
      }
    } catch (error: unknown) {
      console.error("Password verification failed:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Incorrect password. Access denied.";
        const status = error.response?.data?.status;

        if (status === "JWT_EXPIRED" || status === "JWT_MALFORMED" || error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('accessToken');
          setTimeout(() => { window.location.href = '/'; }, 1500);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('An error occurred during verification. Please try again.');
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