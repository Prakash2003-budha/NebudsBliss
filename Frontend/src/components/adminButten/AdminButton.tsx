import React from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png";

// 1. Tell TypeScript that this component now accepts an onClick prop from its parent
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

  // If the user isn't an admin, hide the button completely
  if (!isAdmin) return null;

  return (
    <button 
      onClick={onClick} // 2. Fire the layout's state changer here when clicked
      className={styles.addButton}
      aria-label="Add New Item"
      title="Admin Panel: Add New Item"
    >
      <img src={addButton} alt="Add Item" className={styles.btnIcon} />
    </button>
  );
};

export default AdminButton;