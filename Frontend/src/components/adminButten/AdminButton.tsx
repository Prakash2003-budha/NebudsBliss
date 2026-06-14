import React, { useEffect, useState } from "react";
import styles from "./adminButton.module.scss";
import addButton from "../../img/icons/add.png";

const AdminButton: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Grab the user data string from localStorage (or sessionStorage)
    const storedUser = localStorage.getItem("user"); // Change "user" to whatever key you use to store the login data

    if (storedUser) {
      try {
        // 2. Parse the JSON string into an object
        const userData = JSON.parse(storedUser);

        if (userData && userData.role === "Admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleAddItem = () => {
    alert("Add product action triggered!");
  };

  if (!isAdmin) return null;

  return (
    <div className={styles.adminControlPanel} title="Admin Panel">
      <button 
        onClick={handleAddItem} 
        className={styles.addButton}
        aria-label="Add New Item"
      >
        <img src={addButton} alt="Add Item" className={styles.btnIcon} />
      </button>
    </div>
  );
};

export default AdminButton;