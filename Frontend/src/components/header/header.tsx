import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';

export default function Header() {
  const navigate = useNavigate(); 

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/">
          <img src={logo} alt="Company Logo" className={styles.logo} />
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <div className={styles.categoryDropdown}>
          <span className={styles.navLink}>Categories</span>
          <div className={styles.dropdownMenu}>
            <Link to="/category/earbuds" className={styles.dropdownItem}>Earbuds</Link>
            <Link to="/category/powerbank" className={styles.dropdownItem}>Powerbanks</Link>
            <Link to="/category/camera" className={styles.dropdownItem}>Cameras</Link>
            <Link to="/category/accessories" className={styles.dropdownItem}>Accessories</Link>
          </div>
        </div>
        <Link to="/AboutUs" className={styles.navLink}>About Us</Link>
        <Link to="/contact" className={styles.navLink}>Contact</Link>
      </nav>
      <div className={styles.signButton}>
        {/* 3. navigate() will now work perfectly */}
        <button className={styles.SignInButton} onClick={() => navigate('/LoginPage')}>Sign In</button>
        <button className={styles.SignUpButton}>Sign Up</button>
      </div>
    </header>
  );
}