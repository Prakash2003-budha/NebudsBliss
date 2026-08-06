import React from 'react';
import styles from "./aboutUs.page.module.scss";
import Layout from '../../components/layout/layout';
import logo from '../../img/logo/logo.transparent.png';

const AboutUsPage: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        {/* ===== Hero ===== */}
        <section className={styles.hero}>
          <img src={logo} alt="NebudsBliss logo" className={styles.logo} />
          <span className={styles.eyebrow}>About NebudsBliss</span>
          <h1>Comfort and care for every little moment</h1>
          <p>
            NebudsBliss is a family-run shop dedicated to the baby essentials —
            from gentle clothing to everyday must-haves — with the quality and
            attention your little one deserves.
          </p>
        </section>

        {/* ===== Story ===== */}
        <section className={styles.story}>
          <div className={styles.storyText}>
            <span className={styles.sectionLabel}>Our Story</span>
            <h2>Made for parents, trusted by families</h2>
            <p>
              We started NebudsBliss with a simple idea: shopping for your baby
              should feel as light and easy as the products themselves. Every
              item in our catalogue is hand-picked for safety, comfort and
              durability.
            </p>
            <p>
              Whether you are stocking up on daily essentials or hunting for the
              perfect gift, our team is here from the moment you browse to the
              day your parcel reaches your doorstep.
            </p>
          </div>

          <div className={styles.storyCards}>
            <div className={styles.statCard}>
              <strong>100%</strong>
              <span>Quality &amp; hand-checked items</span>
            </div>
            <div className={styles.statCard}>
              <strong>Fast</strong>
              <span>Delivery across Nepal</span>
            </div>
            <div className={styles.statCard}>
              <strong>24/7</strong>
              <span>Friendly customer support</span>
            </div>
          </div>
        </section>

        {/* ===== Values ===== */}
        <section className={styles.values}>
          <span className={styles.sectionLabel}>What we stand for</span>
          <h2>Why families choose NebudsBliss</h2>

          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <span className={styles.valueIcon} aria-hidden="true">🛡️</span>
              <h3>Safety first</h3>
              <p>
                Every product is reviewed against strict standards, so you can
                rest easy knowing your little one is protected.
              </p>
            </div>

            <div className={styles.valueCard}>
              <span className={styles.valueIcon} aria-hidden="true">🌿</span>
              <h3>Soft &amp; gentle</h3>
              <p>
                Materials chosen with delicate skin in mind — comfort that keeps
                your baby happy all day long.
              </p>
            </div>

            <div className={styles.valueCard}>
              <span className={styles.valueIcon} aria-hidden="true">🚚</span>
              <h3>Reliable delivery</h3>
              <p>
                Careful packing and fast shipping, so your order arrives intact,
                safe and right on time.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className={styles.cta}>
          <h2>Have a question about our products?</h2>
          <p>
            We are only a message away — happy to help you pick the right
            essentials for your little one.
          </p>
          <a
            href="https://wa.me/9779864120605?text=Hello%20NebudsBliss!%20I%27d%20like%20to%20know%20more%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Chat with us on WhatsApp
          </a>
        </section>
      </div>
    </Layout>
  );
};

export default AboutUsPage;