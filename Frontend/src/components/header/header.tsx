import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../img/logo/logo.jpg';
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
        <Link to="/about" className={styles.navLink}>Products</Link>
        <Link to="/services" className={styles.navLink}>AboutUs</Link>
        <Link to="/contact" className={styles.navLink}>Contact</Link>
      </nav>
      <div className={styles.signButton}>
        <button className={styles.SignInButton}>Sign In</button>
        <button className={styles.SignUpButton}>Sign Up</button>
      </div>
    </header>
  );
}