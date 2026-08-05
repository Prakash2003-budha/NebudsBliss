import React, { useState } from "react";
import LoginPage from "./loginPage/login.page";
import SignUpModal from "./registerPage/register.page";

export const StandaloneLogin: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  return showRegister ? (
    <SignUpModal
      isOpen
      onClose={() => (window.location.href = "/")}
      onSwitchToLogin={() => setShowRegister(false)}
    />
  ) : (
    <LoginPage
      isOpen
      onClose={() => (window.location.href = "/")}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  );
};

export const StandaloneRegister: React.FC = () => (
  <SignUpModal
    isOpen
    onClose={() => (window.location.href = "/")}
    onSwitchToLogin={() => (window.location.href = "/login")}
  />
);