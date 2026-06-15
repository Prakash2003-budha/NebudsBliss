import React from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png";

const AdminButton: React.FC = () => {
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

  const handleAddItem = () => {
    alert("Add product action triggered!");
  };

  if (!isAdmin) return null;

  // Render ONLY the button now
  return (
    <button 
      onClick={handleAddItem} 
      className={styles.addButton}
      aria-label="Add New Item"
      title="Admin Panel: Add New Item"
    >
      <img src={addButton} alt="Add Item" className={styles.btnIcon} />
    </button>
  );
};

export default AdminButton;