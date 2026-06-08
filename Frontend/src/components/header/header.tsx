import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';
import profileIcon from "../../img/icons/profile.white.png";

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

  // 1. We brought setUser back so we can clear the user state on logout!
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem('user');
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 2. The Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user'); // Removes the user from browser memory
    setUser(null); // Instantly updates the UI back to Sign In / Sign Up
    navigate('/'); // Optionally redirect them to the home page
    closeSidebar(); // Closes the mobile menu if it's open
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

        {/* Desktop Authentication Buttons */}
        <div className={styles.signButton}>
          {user ? (
            <div className={styles.profileContainer}>
              <img 
                src={user.image?.url || profileIcon} 
                alt="User Profile" 
                className={styles.profileImage} 
              />
              
              {/* Desktop Hover Dropdown Menu */}
              <div className={styles.profileDropdown}>
                <Link to="/profile" className={styles.dropdownItem}>My Profile</Link>
                {/* Desktop Logout Button */}
                <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
              </div>
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
    </>
  );
}