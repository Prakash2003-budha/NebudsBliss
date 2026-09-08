import React from "react";
import styles from './footer.module.scss';
import logo from '../../img/logo/logo.transparent.png';
import facebookIcon from "../../img/icons/socialMedia/Facebook.png";
import WhatsAppIcon from "../../img/icons/socialMedia/WhatsApp.png";
import instagramIcon from "../../img/icons/socialMedia/Instagram.png";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brandSection}>
                    <img src={logo} alt="Nebuds Bliss Logo" className={styles.logo} />
                    <p className={styles.description}>
                        Thoughtful tech for everyday life. Discover reliable gadgets, friendly
                        service, and a better way to shop.
                    </p>
                    <div className={styles.socials}>
                        <a href="https://www.facebook.com/profile.php?id=61590495154162" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <img src={facebookIcon} alt="Facebook Profile" />
                        </a>
                        <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <img src={WhatsAppIcon} alt="WhatsApp Contact" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <img src={instagramIcon} alt="Instagram Profile" />
                        </a>
                    </div>
                </div>

                {/* Categories Navigation */}
                <nav className={styles.linksSection} aria-label="Footer Category Links">
                    <h3 className={styles.title}>Categories</h3>
                    <ul>
                        <li><a href="/category/earbuds">Earbuds</a></li>
                        <li><a href="/category/fans">Fans</a></li>
                        <li><a href="/category/powerbanks">Power Banks</a></li>
                        <li><a href="/category/chargers">Chargers</a></li>
                    </ul>
                </nav>

                {/* Information Navigation */}
                <nav className={styles.linksSection} aria-label="Footer Information Links">
                    <h3 className={styles.title}>Information</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                    </ul>
                </nav>

                <div className={styles.contactSection}>
                    <h3 className={styles.title}>Get in touch</h3>
                    <p>Have a question about a product or your order?</p>
                    <a className={styles.contactLink} href="tel:+9779864120605">
                        <span className={styles.contactIcon} aria-hidden="true">↗</span>
                        <span>
                            <small>Call us</small>
                            +977 9864120605
                        </span>
                    </a>
                    <a className={styles.contactLink} href="mailto:Nebudsbliss@gmail.com">
                        <span className={styles.contactIcon} aria-hidden="true">@</span>
                        <span>
                            <small>Email us</small>
                            Nebudsbliss@gmail.com
                        </span>
                    </a>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className={styles.bottomBar}>
                <p>&copy; {currentYear} Nebuds Bliss. All rights reserved.</p>
                <span>Made for better everyday tech.</span>
            </div>
        </footer>
    );
};

export default Footer;