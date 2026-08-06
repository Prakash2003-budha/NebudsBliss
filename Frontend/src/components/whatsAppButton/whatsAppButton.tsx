import React from "react";
import styles from "./whatsAppButton.module.scss";
import whatsAppIcon from "../../img/icons/socialMedia/WhatsApp.png";

// WhatsApp click-to-chat target. Uses the same number as the Contact page.
// Digits only, no "+", spaces or dashes: 977 9864120605
const WHATSAPP_NUMBER = "9779864120605";

// Pre-filled message so users don't have to type anything.
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello NebudsBliss! I'd like to know more about your products."
);

const WhatsAppButton: React.FC = () => {
  const chatHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <a
      href={chatHref}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsAppButton}
      aria-label="Chat with us on WhatsApp"
    >
      <img
        src={whatsAppIcon}
        alt="WhatsApp"
        className={styles.whatsAppIcon}
      />
      <span className={styles.tooltip} aria-hidden="true">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;