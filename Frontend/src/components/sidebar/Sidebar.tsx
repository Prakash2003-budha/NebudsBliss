import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.scss'; 
import profileIcon from "../../img/icons/profile.white.png";

// 1. Define what types of data your props are
// 1. Define the exact shape of your User data
interface UserType {
  fullName: string;
  image?: {
    url: string;
  };
}
// 2. Update your SidebarProps
interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  // Tell TS the user is either the UserType object, or null (if not logged in)
  user: UserType | null; 
  handleLogout: () => void;
}

// 2. Attach the SidebarProps interface to your function parameters
export default function Sidebar({ isOpen, closeSidebar, user, handleLogout }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.sidebarWrapper}>
      
      {/* Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={closeSidebar} 
      />

      {/* Drawer */}
      <aside className={`${styles.sidebarDrawer} ${isOpen ? styles.sidebarOpen : ''}`}>
        <nav className={styles.sidebarNav}>
          <Link to="/" className={styles.sidebarNavLink} onClick={closeSidebar}>Home</Link>
          
          <div className={styles.sidebarSectionHeading}>Categories</div>
          <div className={styles.sidebarSubMenu}>
            <Link to="/category/earbuds" className={styles.sidebarSubLink} onClick={closeSidebar}>Earbuds</Link>
            <Link to="/category/powerbanks" className={styles.sidebarSubLink} onClick={closeSidebar}>Powerbank</Link>
            <Link to="/category/cameras" className={styles.sidebarSubLink} onClick={closeSidebar}>Camera</Link>
            <Link to="/category/accessories" className={styles.sidebarSubLink} onClick={closeSidebar}>Accessories</Link>
            <Link to="/category/fans" className={styles.sidebarSubLink} onClick={closeSidebar}>Fan</Link>
          </div>

          <Link to="/AboutUs" className={styles.sidebarNavLink} onClick={closeSidebar}>About Us</Link>
          <Link to="/contact" className={styles.sidebarNavLink} onClick={closeSidebar}>Contact</Link>
        </nav>

        <div className={styles.sidebarAuthButtons}>
          {user ? (
            <>
              <div 
                className={styles.sidebarProfileContainer} 
                onClick={() => { navigate('/profile'); closeSidebar(); }}
              >
                <img 
                  src={user.image?.url || profileIcon} 
                  alt="User Profile" 
                  className={styles.sidebarProfileImage} 
                />
                <span className={styles.sidebarProfileName}>{user.fullName}</span>
              </div>
              <button className={styles.LogoutButton} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className={styles.SignInButton} onClick={() => { navigate('/LoginPage'); closeSidebar(); }}>Sign In</button>
              <button className={styles.SignUpButton} onClick={() => { navigate('/SignUp'); closeSidebar(); }}>Sign Up</button>
            </>
          )}
        </div>
      </aside>
      
    </div>
  );
}