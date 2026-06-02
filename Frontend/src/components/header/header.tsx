import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../public/img/logo/logo.jpg'; // Path to your logo
import styles from './header.module.scss'; // Path to your CSS Module

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
        <Link to="/about" className={styles.navLink}>About</Link>
        <Link to="/services" className={styles.navLink}>Services</Link>
        <Link to="/contact" className={styles.navLink}>Contact</Link>
      </nav>
    </header>
  );
}