import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Route guard for the whole /admin section.
 * Only a logged-in user with role "Admin" may see the admin panel —
 * everyone else is redirected back to the storefront.
 */
const RequireAdmin: React.FC = () => {
  let isAdmin = false;

  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    isAdmin = !!user && user.role === "Admin";
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
