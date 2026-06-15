import React, { useState } from 'react';
import styles from './passwordConfirmModal.module.scss';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return alert("Please enter your password to authorize this action.");
    
    onConfirm(password);
    setPassword(''); // Clear input field
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Confirm Admin Action</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <p className={styles.warningText}>
          You are about to modify the catalog database. Please type your password to confirm.
        </p>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.inputGroup}>
            <label>Admin Password</label>
            <input 
              type="password" 
              placeholder="Enter your security password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.actionButtonGroup}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton}>
              Verify & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;