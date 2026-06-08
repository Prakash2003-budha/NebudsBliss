import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';
import profileIcon from "../../img/icons/profile.white.png"; // Renamed slightly to avoid confusion

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Header() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // ------------------------------------------------------------------
  // TODO: Replace this mock user with your actual authentication state
  // Example: const { user, logout } = useAuth(); 
  // ------------------------------------------------------------------
  const user = {
    name: "User Name",
    profilePic: null // If null, it will fall back to your imported profileIcon
  }; 

  return (
    <>
      <header className={styles.header}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Link to="/" onClick={closeSidebar}>
            <img src={logo} alt="Company Logo" className={styles.logo} />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Home</Link>
          
          <div className={styles.categoryDropdown}>
            <span className={styles.navLink}>Categories</span>
            <div className={styles.dropdownMenu}>
              <Link to="/category/earbuds" className={styles.dropdownItem}>Earbuds</Link>
              <Link to="/category/powerbanks" className={styles.dropdownItem}>Powerbank</Link>
              <Link to="/category/cameras" className={styles.dropdownItem}>Camera</Link>
              <Link to="/category/accessories" className={styles.dropdownItem}>Accessories</Link>
              <Link to="/category/fans" className={styles.dropdownItem}>Fan</Link>
            </div>
          </div>
          
          <Link to="/AboutUs" className={styles.navLink}>About Us</Link>
          <Link to="/ContactPage" className={styles.navLink}>Contact</Link>
        </nav>

        <div className={styles.signButton}>
          {user ? (
            <div className={styles.profileContainer} onClick={() => navigate('/profile')}>
              <img 
                src={user.profilePic || profileIcon} 
                alt="User Profile" 
                className={styles.profileImage} 
              />
            </div>
          ) : (
            <>
              <button className={styles.SignInButton} onClick={() => navigate('/LoginPage')}>Sign In</button>
              <button className={styles.SignUpButton} onClick={() => navigate('/SignUp')}>Sign Up</button>
            </>
          )}
        </div>

        {/* Hamburger Menu Trigger */}
        <button className={styles.hamburgerMenu} onClick={toggleSidebar} aria-label="Toggle Navigation">
          {isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </header>

      {/* ── MOBILE SIDEBAR DRAWERS ── */}
      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.overlayVisible : ''}`} 
        onClick={closeSidebar} 
      />

      <aside className={`${styles.sidebarDrawer} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
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

        {/* Mobile Authentication / Profile Section */}
        <div className={styles.sidebarAuthButtons}>
          {user ? (
            <div 
              className={styles.sidebarProfileContainer} 
              onClick={() => { navigate('/profile'); closeSidebar(); }}
            >
              <img 
                src={user.profilePic || profileIcon} 
                alt="User Profile" 
                className={styles.sidebarProfileImage} 
              />
              <span className={styles.sidebarProfileName}>{user.name}</span>
            </div>
          ) : (
            <>
              <button className={styles.SignInButton} onClick={() => { navigate('/LoginPage'); closeSidebar(); }}>Sign In</button>
              <button className={styles.SignUpButton} onClick={() => { navigate('/SignUp'); closeSidebar(); }}>Sign Up</button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}