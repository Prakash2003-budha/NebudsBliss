import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';
import profileIcon from "../../img/icons/profile.white.png";
import Sidebar from '../sidebar/sidebar';

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

  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem('user');
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    setUser(null); 
    navigate('/'); 
    closeSidebar(); 
  };

  // NEW: Automatically close the sidebar if the screen gets resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

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
              
              <div className={styles.profileDropdown}>
                <Link to="/profile" className={styles.dropdownItem}>My Profile</Link>
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

      {/* NEW: Wrapped Sidebar in a mobile-only container */}
      <div className={styles.mobileOnlySidebar}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={closeSidebar} 
          user={user} 
          handleLogout={handleLogout} 
        />
      </div>
    </>
  );
}