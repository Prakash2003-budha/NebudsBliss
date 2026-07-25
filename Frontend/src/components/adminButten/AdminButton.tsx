import React from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png";

interface AdminButtonProps {
  onClick: () => void;
}

const AdminButton: React.FC<AdminButtonProps> = ({ onClick }) => {
  const getIsAdmin = (): boolean => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData?.role === "Admin";
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    return false;
  };

  const isAdmin = getIsAdmin();

  if (!isAdmin) return null;

  return (
    <button 
      onClick={onClick} 
      className={styles.addButton}
      aria-label="Add New Item"
      title="Admin Panel: Add New Item"
    >
      <img src={addButton} alt="Add Item" className={styles.btnIcon} />
    </button>
  );
};

export default AdminButton;