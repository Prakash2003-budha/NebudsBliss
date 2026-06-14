import React from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png"

interface AdminButtonProps {
  userRole: string; // "admin", "customer", etc.
  onAdd: () => void;
  onModify: () => void;
}

const AdminButton: React.FC<AdminButtonProps> = ({ userRole, onAdd, onModify }) => {
  if (userRole !== "admin") return null;

  return (
    <div className={styles.adminControlPanel}>
      <button onClick={onAdd} className={styles.addButton}>
       <img src={addButton} alt="" />Add New Item
      </button>
      <button onClick={onModify} className={styles.modifyButton}>
        ⚙️ Modify Items
      </button>
    </div>
  );
};

export default AdminButton;