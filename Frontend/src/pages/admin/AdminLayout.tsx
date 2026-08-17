import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import styles from "./AdminLayout.module.scss";

type IconProps = { children: React.ReactNode };

const Icon: React.FC<IconProps> = ({ children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

interface NavItem {
  to: string;
  end?: boolean;
  label: string;
  section: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/admin",
    end: true,
    label: "Dashboard",
    section: "Overview",
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </Icon>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    section: "Sales",
    icon: (
      <Icon>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </Icon>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    section: "Catalogue",
    icon: (
      <Icon>
        <path d="M16.5 9.4l-9-5.19" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </Icon>
    ),
  },
  {
    to: "/admin/products/new",
    label: "Add Product",
    section: "Catalogue",
    icon: (
      <Icon>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </Icon>
    ),
  },
  {
    to: "/admin/media",
    label: "Media & Banners",
    section: "Website Content",
    icon: (
      <Icon>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </Icon>
    ),
  },
  {
    to: "/admin/promos",
    label: "Promo Codes",
    section: "Website Content",
    icon: (
      <Icon>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </Icon>
    ),
  },
  {
    to: "/admin/reviews",
    label: "Reviews",
    section: "Website Content",
    icon: (
      <Icon>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </Icon>
    ),
  },
];

const getTitle = (pathname: string): string => {
  if (pathname === "/admin" || pathname === "/admin/") return "Dashboard";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/products/new")) return "Add Product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/media")) return "Media & Banners";
  if (pathname.startsWith("/admin/promos")) return "Promo Codes";
  if (pathname.startsWith("/admin/reviews")) return "Reviews";
  return "Admin";
};

interface StoredUser {
  fullName?: string;
  email?: string;
  image?: string;
}

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  let user: StoredUser | null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const sections = Array.from(new Set(NAV_ITEMS.map((item) => item.section)));

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <Link to="/" className={styles.brand} onClick={() => setSidebarOpen(false)}>
          <img src="/logo.transparent.png" alt="NebudsBliss" className={styles.brandLogo} />
          <span className={styles.brandName}>NebudsBliss</span>
          <span className={styles.brandRole}>Admin</span>
        </Link>

        <nav className={styles.nav}>
          {sections.map((section) => (
            <React.Fragment key={section}>
              <div className={styles.navSection}>{section}</div>
              {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeLink : ""}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            {user?.image ? (
              <img src={user.image} alt="Profile" />
            ) : (
              <img src="/logo.transparent.png" alt="Profile" />
            )}
            <div className={styles.userChipText}>
              <div className={styles.userChipName}>{user?.fullName || "Administrator"}</div>
              <div className={styles.userChipRole}>Store admin</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <Icon>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </Icon>
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={styles.content}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <Icon>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </Icon>
          </button>
          <span className={styles.topbarTitle}>{getTitle(location.pathname)}</span>
          <div className={styles.topbarRight}>
            <Link to="/" className={styles.viewStore}>
              <Icon>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </Icon>
              View store
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};
export default AdminLayout;