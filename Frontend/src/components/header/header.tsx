import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';

export default function Header() {
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
        <button className={styles.SignUpButton}>Sign In</button>
        <button className={styles.SignInButton}>Sign Up</button>
      </div>
    </header>
  );
}