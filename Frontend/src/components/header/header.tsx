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
            <Link to="/category/earbuds" className={styles.dropdownItem}></Link>
            <Link to="/category/powerbanks" className={styles.dropdownItem}>Powerbank</Link>
            <Link to="/category/cameras" className={styles.dropdownItem}>Camera</Link>
            <Link to="/category/accessories" className={styles.dropdownItem}>Accessories</Link>
            <Link to="/category/fans" className={styles.dropdownItem}>Fan</Link>
          </div>
        </div>
        <Link to="/AboutUs" className={styles.navLink}>About Us</Link>
        <Link to="/contact" className={styles.navLink}>Contact</Link>
      </nav>
      <div className={styles.signButton}>
        {/* 3. navigate() will now work perfectly */}
        <button className={styles.SignInButton} onClick={() => navigate('/LoginPage')}>Sign In</button>
        <button className={styles.SignUpButton}onClick={() => navigate('/SignUp')}>Sign Up</button>
      </div>
    </header>
  );
}