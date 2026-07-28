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
}

// 2. Component
export default function Sidebar({ isOpen, closeSidebar, user, handleLogout }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.sidebarWrapper}>
      
      {/* Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={closeSidebar} 
      />

      {/* Drawer */}
      <aside className={`${styles.sidebarDrawer} ${isOpen ? styles.sidebarOpen : ''}`}>
        
        {/* Profile Header (Always shows: User or Guest) */}
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
            // Adds a dark background if they are a guest so the white icon is visible
            style={!user?.image?.url ? { backgroundColor: '#000' } : {}} 
          />
          <span className={styles.sidebarProfileName}>
            {user ? user.fullName : 'Welcome, Guest!'}
          </span>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <Link to="/" className={styles.sidebarNavLink} onClick={closeSidebar}>Home</Link>
          
          <Link to="/shop" className={styles.sidebarNavLink} onClick={closeSidebar}>Shop</Link>
          <div className={styles.sidebarSectionHeading}>Categories</div>
          <div className={styles.sidebarSubMenu}>
            <Link to="/shop" className={styles.sidebarSubLink} onClick={closeSidebar}>All Products</Link>
            <Link to="/category/earbuds" className={styles.sidebarSubLink} onClick={closeSidebar}>Earbuds</Link>
            <Link to="/category/powerbanks" className={styles.sidebarSubLink} onClick={closeSidebar}>Powerbank</Link>
            <Link to="/category/cameras" className={styles.sidebarSubLink} onClick={closeSidebar}>Camera</Link>
            <Link to="/category/accessories" className={styles.sidebarSubLink} onClick={closeSidebar}>Accessories</Link>
            <Link to="/category/fans" className={styles.sidebarSubLink} onClick={closeSidebar}>Fan</Link>
          </div>

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