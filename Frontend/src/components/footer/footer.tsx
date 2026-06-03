import React from "react";
import styles from './footer.module.scss';
import logo from '../../img/logo/logo.transparent.png';
import facebookIcon from "../../img/icons/socialMedia/Facebook.png" 
import WhatsAppIcon from "../../img/icons/socialMedia/WhatsApp.png"
import instagramIcon from "../../img/icons/socialMedia/Instagram.png"

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brandSection}>
                    <img src={logo} alt="Company Logo" className={styles.logo} />
                    <p className={styles.description}>
                        Building excellent digital experiences with modern web technologies.
                    </p>
                    <div className={styles.socials}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <img src={facebookIcon} alt="Facebook" />
                        </a>
                        <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <img src={WhatsAppIcon} alt="Twitter" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <img src={instagramIcon} alt="Instagram" />
                        </a>
                    </div>
                </div>

                <nav className={styles.linksSection} aria-label="Footer Category Links">
                    <h3 className={styles.title}>Categories</h3>
                    <ul>
                        <li><a href="/category/development">Earbud</a></li>
                        <li><a href="/category/design">Fan</a></li>
                        <li><a href="/category/marketing">PowerBank</a></li>
                        <li><a href="/category/business">Charger</a></li>
                    </ul>
                </nav>
                <nav className={styles.linksSection} aria-label="Footer Information Links">
                    <h3 className={styles.title}>Information</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                </nav>
            </div>

            {/* Bottom Copyright Bar */}
            <div className={styles.bottomBar}>
                <p>&copy; {currentYear} YourCompany. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;