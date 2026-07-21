import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../img/logo/logoFull.jpg';
import styles from './header.module.scss';
import profileIcon from "../../img/icons/profile.white.png";
import Sidebar from '../sidebar/Sidebar';

// 1. IMPORT BOTH MODAL COMPONENTS
import LoginPage from '../../pages/auth/loginPage/login.page';
import SignUpPage from '../../pages/auth/registerPage/register.page'; 

// (Assuming HamburgerIcon and CloseIcon are defined/imported here in your actual file)

export default function Header() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. STATE FOR BOTH MODALS
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem('user');
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    setUser(null); 
    navigate('/'); 
    closeSidebar(); 
  };

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
        <div className={styles.logoContainer}>
          <Link to="/" onClick={closeSidebar}>
            <img src={logo} alt="Company Logo" className={styles.logo} />
          </Link>
        </div>

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
            <div className={styles.profileContainer}>
              <img src={user.image?.url || profileIcon} alt="User Profile" className={styles.profileImage} />
              <div className={styles.profileDropdown}>
                <Link to="/profile" className={styles.dropdownItem}>My Profile</Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
              </div>
            </div>
          ) : (
            <>
              {/* 3. THESE TRIGGER THE MODALS */}
              <button className={styles.SignInButton} onClick={() => setIsLoginModalOpen(true)}>Sign In</button>
              <button className={styles.SignUpButton} onClick={() => setIsRegisterModalOpen(true)}>Sign Up</button>
            </>
          )}
        </div>
        
        <button className={styles.hamburgerMenu} onClick={toggleSidebar} aria-label="Toggle Navigation">
          <span className={`${styles.hamburgerBar} ${isSidebarOpen ? styles.barOpenTop : ''}`} />
          <span className={`${styles.hamburgerBar} ${isSidebarOpen ? styles.barOpenMid : ''}`} />
          <span className={`${styles.hamburgerBar} ${isSidebarOpen ? styles.barOpenBottom : ''}`} />
        </button>
      </header>

      {/* Sidebar remains the same */}
      <div className={styles.mobileOnlySidebar}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} user={user} handleLogout={handleLogout} />
      </div>

      {/* 4. RENDER MODALS WITH ALL REQUIRED PROPS */}
      <LoginPage 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      
      <SignUpPage 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
}