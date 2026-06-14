import React from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png"; // Your icon import

interface AdminButtonProps {
  onAdd?: () => void; // Optional click handler
}

const AdminButton: React.FC<AdminButtonProps> = ({ onAdd }) => {
  return (
    <div className={styles.adminControlPanel}>
      <button 
        onClick={onAdd} 
        className={styles.addButton}
        aria-label="Add New Item"
      >
        <img src={addButton} alt="Add Item" className={styles.btnIcon} />
      </button>
    </div>
  );
};

export default AdminButton;