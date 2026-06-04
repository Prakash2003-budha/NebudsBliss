import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import hamburgermenue from '../../img/icons/HamburgerMenue.png';
import styles from './header.module.scss';

export default function Header() {
  const navigate = useNavigate();
  
  // State for responsive mobile navigation drawer
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for the Daraz-style Login Modal popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Connects to your backend ES5 endpoint later
    console.log("Sending OTP to:", phoneNumber);
  };

  return (
    <>
      <header className={styles.header}>
        {/* Logo Section */}
        <div className={styles.logoContainer}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <img src={logo} alt="Company Logo" className={styles.logo} />
          </Link>
        </div>

        {/* Hamburger Icon Button for Mobile */}
        <button className={styles.menuToggle} onClick={toggleMobileMenu}>
          <img src={hamburgermenue} alt="Menu" className={styles.hamburgerIcon} />
        </button>

        {/* Navigation Links Group */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <Link to="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</Link>
          
          <div className={styles.categoryDropdown}>
            <span className={styles.navLink}>Categories</span>
            <div className={styles.dropdownMenu}>
              <Link to="/category/earbuds" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>Earbuds</Link>
              <Link to="/category/powerbanks" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>Powerbank</Link>
              <Link to="/category/cameras" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>Camera</Link>
              <Link to="/category/accessories" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>Accessories</Link>
              <Link to="/category/fans" className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>Fan</Link>
            </div>
          </div>
          
          <Link to="/AboutUs" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</Link>
          
          {/* Mobile View: Move authorization actions inside the hamburger drawer */}
          <div className={styles.mobileSignButton}>
            <button className={styles.SignInButton} onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}>Sign In</button>
            <button className={styles.SignUpButton} onClick={() => { navigate('/SignUp'); setIsMenuOpen(false); }}>Sign Up</button>
          </div>
        </nav>

        {/* Desktop View Action Buttons */}
        <div className={styles.signButton}>
          <button className={styles.SignInButton} onClick={() => setIsModalOpen(true)}>Sign In</button>
          <button className={styles.SignUpButton} onClick={() => navigate('/SignUp')}>Sign Up</button>
        </div>
      </header>

      {/* --- DARAZ STYLE AUTH MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
            
            <h3>Sign up / Login</h3>
            
            <form onSubmit={handleLoginSubmit}>
              <div className={styles.inputGroup}>
                <span className={styles.countryCode}>NP +977</span>
                <input 
                  type="tel" 
                  placeholder="Please enter your phone number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.termsGroup}>
                <input type="checkbox" id="termsCheck" required />
                <label htmlFor="termsCheck">
                  By creating your account, you agree to our <a href="#/terms">Terms of Use</a> and <a href="#/privacy">Privacy Policy</a>.
                </label>
              </div>

              <button type="submit" className={`${styles.btn} ${styles.btnWhatsapp}`}>Send code via Whatsapp</button>
              <button type="submit" className={`${styles.btn} ${styles.btnSms}`}>Send code via SMS</button>
            </form>

            <div className={styles.divider}>Or, sign up with</div>

            <div className={styles.socialGroup}>
              <button className={styles.btnSocial}>Google</button>
              <button className={styles.btnSocial}>Facebook</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}