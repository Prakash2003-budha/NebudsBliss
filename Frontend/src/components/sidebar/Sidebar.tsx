import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.scss'; 
import profileIcon from "../../img/icons/profile.white.png";

// 1. Types
interface UserType {
  fullName: string;
  image?: {
    url: string;
  };
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  user: UserType | null; 
  handleLogout: () => void;
  onRequireLogin?: () => void;
}

// 2. Component
export default function Sidebar({ isOpen, closeSidebar, user, handleLogout, onRequireLogin }: SidebarProps) {
  const navigate = useNavigate();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Open My Orders if signed in, otherwise trigger the login popup.
  const handleMyOrdersClick = () => {
    closeSidebar();
    if (user) {
      navigate('/orders');
    } else if (onRequireLogin) {
      onRequireLogin();
    } else {
      navigate('/LoginPage');
    }
  };

  // Lock body scroll while the drawer is open so the page behind doesn't move.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className={styles.sidebarWrapper}>
      
      {/* Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={closeSidebar} 
      />

      {/* Drawer */}
      <aside className={`${styles.sidebarDrawer} ${isOpen ? styles.sidebarOpen : ''}`}>

        {/* Top bar: profile (left) + close button (right) */}
        <div className={styles.sidebarTopBar}>
          <div
            className={styles.sidebarProfileHeader}
            onClick={() => {
              if (user) { navigate('/profile'); }
              else { navigate('/LoginPage'); }
              closeSidebar();
            }}
          >
            <img
              src={user?.image?.url || profileIcon}
              alt="User Profile"
              className={styles.sidebarProfileImage}
              // Adds a dark background for guests so the white icon stays visible
              style={!user?.image?.url ? { backgroundColor: '#000' } : {}}
            />
            <span className={styles.sidebarProfileName}>
              {user ? user.fullName : 'Welcome, Guest!'}
            </span>
          </div>

          <button
            className={styles.sidebarClose}
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <Link to="/" className={styles.sidebarNavLink} onClick={closeSidebar}>Home</Link>

          <Link to="/shop" className={styles.sidebarNavLink} onClick={closeSidebar}>Shop</Link>

          <div className={styles.sidebarCategoryBlock}>
            <button
              type="button"
              className={styles.sidebarCategoryToggle}
              onClick={() => setIsCategoriesOpen((current) => !current)}
              aria-expanded={isCategoriesOpen}
            >
              <span>Categories</span>
              <svg
                viewBox="0 0 20 20"
                className={`${styles.categoryChevron} ${isCategoriesOpen ? styles.categoryChevronOpen : ''}`}
                aria-hidden="true"
              >
                <path d="M5.5 7.5L10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isCategoriesOpen && (
              <div className={styles.sidebarSubMenu}>
                <Link to="/shop" className={styles.sidebarSubLink} onClick={closeSidebar}>All Products</Link>
                <Link to="/category/earbuds" className={styles.sidebarSubLink} onClick={closeSidebar}>Earbuds</Link>
                <Link to="/category/powerbanks" className={styles.sidebarSubLink} onClick={closeSidebar}>Powerbank</Link>
                <Link to="/category/cameras" className={styles.sidebarSubLink} onClick={closeSidebar}>Camera</Link>
                <Link to="/category/accessories" className={styles.sidebarSubLink} onClick={closeSidebar}>Accessories</Link>
                <Link to="/category/fans" className={styles.sidebarSubLink} onClick={closeSidebar}>Fan</Link>
              </div>
            )}
          </div>

          <div className={styles.sidebarDivider} />

          <button
            className={styles.sidebarNavLink}
            onClick={handleMyOrdersClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', width: '100%' }}
          >
            My Orders
          </button>
          <Link to="/AboutUs" className={styles.sidebarNavLink} onClick={closeSidebar}>About Us</Link>
          <Link to="/contact" className={styles.sidebarNavLink} onClick={closeSidebar}>Contact</Link>
        </nav>

        {/* Bottom Action Buttons */}
        <div className={styles.sidebarAuthButtons}>
          {user ? (
            <button className={styles.LogoutButton} onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button className={styles.SignInButton} onClick={() => { navigate('/LoginPage'); closeSidebar(); }}>Sign In</button>
              <button className={styles.SignUpButton} onClick={() => { navigate('/SignUp'); closeSidebar(); }}>Sign Up</button>
            </>
          )}
        </div>

      </aside>
    </div>
  );
}