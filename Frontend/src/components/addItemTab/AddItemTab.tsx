import React from 'react';
import styles from './addItem.Tab.module.scss';

interface AddItemTabProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemTab: React.FC<AddItemTabProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.addItemOverlay} onClick={onClose}>
      <div className={styles.addItemTab} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabHeader}>
          <h3>Add New Item</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <form className={styles.tabContent} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label>Item Name</label>
            <input type="text" placeholder="Enter item name..." />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Price ($)</label>
            <input type="number" placeholder="0.00" step="0.01" />
          </div>

          <button type="submit" className={styles.submitButton}>Add to Catalog</button>
        </form>
      </div>
    </div>
  );
};

export default AddItemTab;