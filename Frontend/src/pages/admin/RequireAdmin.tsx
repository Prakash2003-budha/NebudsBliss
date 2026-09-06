import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Route guard for the whole /admin section.
 * Only a logged-in user with role "Admin" may see the admin panel —
 * everyone else is redirected back to the storefront.
 */
const RequireAdmin: React.FC = () => {
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isAdmin = !!user && user.role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
